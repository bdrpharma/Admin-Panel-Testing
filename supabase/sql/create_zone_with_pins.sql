-- Run this in Supabase SQL Editor.
-- Uses existing public.zones and public.pin_codes tables only.

CREATE OR REPLACE FUNCTION public.create_zone_with_pins(
  p_zone_name text,
  p_zone_code text,
  p_pin_start text,
  p_pin_end text
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_zone_id bigint;
  start_pin integer;
  end_pin integer;
BEGIN
  IF trim(coalesce(p_zone_name, '')) = '' OR trim(coalesce(p_zone_code, '')) = '' THEN
    RAISE EXCEPTION 'Zone name and zone code are required';
  END IF;
  IF p_pin_start !~ '^[0-9]{6}$' OR p_pin_end !~ '^[0-9]{6}$' THEN
    RAISE EXCEPTION 'PINs must contain exactly 6 digits';
  END IF;

  start_pin := p_pin_start::integer;
  end_pin := p_pin_end::integer;
  IF end_pin < start_pin THEN
    RAISE EXCEPTION 'PIN End must be greater than or equal to PIN Start';
  END IF;
  IF end_pin - start_pin > 4999 THEN
    RAISE EXCEPTION 'Maximum 5,000 PIN records allowed per zone';
  END IF;

  IF EXISTS (SELECT 1 FROM zones WHERE lower(zone_code) = lower(trim(p_zone_code))) THEN
    RAISE EXCEPTION 'Zone Code already exists';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pin_codes
    WHERE pin_code IN (SELECT lpad(n::text, 6, '0') FROM generate_series(start_pin, end_pin) AS n)
  ) THEN
    RAISE EXCEPTION 'One or more PIN codes already exist';
  END IF;

  INSERT INTO zones (zone_name, zone_code)
  VALUES (trim(p_zone_name), trim(p_zone_code))
  RETURNING id INTO new_zone_id;

  INSERT INTO pin_codes (pin_code, zone_id)
  SELECT lpad(n::text, 6, '0'), new_zone_id
  FROM generate_series(start_pin, end_pin) AS n;

  RETURN new_zone_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_zone_with_pins(text, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_zone_with_pins(text, text, text, text) TO service_role;
