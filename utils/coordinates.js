// Parse optional latitude/longitude from form fields.
// Empty inputs mean "no coordinates" — this never invents a location.

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function parseOptionalLatLng(latRaw, lngRaw) {
  const latBlank = isBlank(latRaw);
  const lngBlank = isBlank(lngRaw);

  if (latBlank && lngBlank) {
    return { coords: null };
  }

  if (latBlank || lngBlank) {
    return { error: "Latitude and longitude must be provided together, or both left blank." };
  }

  const lat = Number(latRaw);
  const lng = Number(lngRaw);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { error: "Latitude and longitude must be valid numbers." };
  }

  if (lat < -90 || lat > 90) {
    return { error: "Latitude must be between -90 and 90." };
  }

  if (lng < -180 || lng > 180) {
    return { error: "Longitude must be between -180 and 180." };
  }

  return { coords: { lat, lng } };
}

module.exports = { parseOptionalLatLng };
