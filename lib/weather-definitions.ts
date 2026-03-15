/**
 * Weather Metric Definitions
 *
 * Centralized educational content for weather metrics.
 * Used by metric info tooltips (brief) and the glossary page (full content).
 */

export interface MetricRange {
  label: string
  range: string
  description: string
}

export interface WeatherMetricDefinition {
  id: string
  name: string
  brief: string
  detailed: string
  howMeasured: string
  ranges: MetricRange[]
  practicalTips: string[]
}

export const WEATHER_METRICS: Record<string, WeatherMetricDefinition> = {
  'uv-index': {
    id: 'uv-index',
    name: 'UV Index',
    brief: 'An international standard measurement that predicts the strength of sunburn-producing ultraviolet (UV) radiation from the sun at a particular place and time.',
    detailed: 'The UV Index is a standardized scale developed by the World Health Organization (WHO) that measures the intensity of ultraviolet radiation reaching the Earth\'s surface. It ranges from 0 (nighttime) to 11+ (extreme). UV radiation is strongest between 10 AM and 4 PM, at higher altitudes, closer to the equator, and when reflected off snow, water, or sand. Even on cloudy days, up to 80% of UV rays can penetrate cloud cover.',
    howMeasured: 'Calculated using satellite data and ground-based sensors that measure the intensity of UV-A and UV-B radiation. Factors include solar zenith angle, ozone layer thickness, cloud cover, altitude, and surface reflectivity (albedo). The scale is linear — a UV Index of 6 is twice as intense as 3.',
    ranges: [
      { label: 'Low', range: '0-2', description: 'Minimal risk. Safe for most people without protection.' },
      { label: 'Moderate', range: '3-5', description: 'Some risk of harm. Wear sunscreen and sunglasses.' },
      { label: 'High', range: '6-7', description: 'High risk. Seek shade during midday hours.' },
      { label: 'Very High', range: '8-10', description: 'Very high risk. Avoid being outside during midday.' },
      { label: 'Extreme', range: '11+', description: 'Extreme risk. Take all precautions — unprotected skin can burn in minutes.' },
    ],
    practicalTips: [
      'Apply SPF 30+ sunscreen 15 minutes before going outside, even on cloudy days.',
      'The UV Index peaks between 10 AM and 4 PM — plan outdoor activities around these hours.',
      'Snow reflects up to 80% of UV rays, so winter sun protection matters at altitude.',
      'Check the UV Index before outdoor exercise to decide on sun protection gear.',
    ],
  },
  'humidity': {
    id: 'humidity',
    name: 'Humidity',
    brief: 'The amount of water vapor — an invisible gas — present in the air, expressed as a percentage of the maximum moisture the air can hold at that temperature.',
    detailed: 'Relative humidity measures how much water vapor is in the air compared to the maximum it could hold at the current temperature. At 100% humidity, the air is fully saturated and dew or fog forms. Warm air can hold more moisture than cold air, which is why humidity feels more oppressive in summer. Humidity affects how your body cools itself through sweat evaporation — high humidity makes it harder for sweat to evaporate, making it feel hotter than it actually is.',
    howMeasured: 'Measured using a hygrometer, which detects changes in electrical resistance or capacitance as moisture levels change. Weather stations use psychrometers (wet-bulb and dry-bulb thermometer pairs) for precise readings. The percentage represents relative humidity — the ratio of actual water vapor to the maximum possible at that temperature.',
    ranges: [
      { label: 'Dry', range: '0-30%', description: 'Very dry air. Can cause dry skin, static electricity, and respiratory irritation.' },
      { label: 'Comfortable', range: '30-60%', description: 'Ideal comfort range for most people. Pleasant for indoor and outdoor activities.' },
      { label: 'Humid', range: '60-80%', description: 'Noticeably muggy. Sweat evaporates slower, making it feel warmer.' },
      { label: 'Very Humid', range: '80-100%', description: 'Oppressively moist. High heat index risk. Fog and dew likely.' },
    ],
    practicalTips: [
      'Indoor comfort is best between 30-50% — use a humidifier in winter and dehumidifier in summer.',
      'High humidity makes the "feels like" temperature significantly higher than the actual reading.',
      'Low humidity below 20% increases wildfire risk and can damage wooden instruments and furniture.',
      'Dew point (related to humidity) above 65°F generally feels uncomfortable for most people.',
    ],
  },
  'pressure': {
    id: 'pressure',
    name: 'Barometric Pressure',
    brief: 'The weight of the atmosphere pressing down on the Earth\'s surface, measured in hectopascals (hPa) or inches of mercury (inHg). Changes in pressure signal incoming weather shifts.',
    detailed: 'Barometric pressure (also called atmospheric pressure) is the force exerted by the weight of air molecules above a given point. Standard sea-level pressure is 1013.25 hPa (29.92 inHg). Pressure changes are one of the most reliable short-term weather predictors — falling pressure typically signals approaching storms, clouds, or rain, while rising pressure usually indicates clearing skies and fair weather. Pressure also decreases with altitude, dropping about 1 hPa for every 8 meters of elevation gain.',
    howMeasured: 'Measured with a barometer. Mercury barometers use a column of mercury in a glass tube — atmospheric pressure pushes the mercury up. Modern digital barometers use piezoelectric sensors. Readings are adjusted to sea-level equivalent for meaningful comparison between locations at different altitudes.',
    ranges: [
      { label: 'Low', range: 'Below 1000 hPa', description: 'Associated with stormy weather, clouds, and precipitation.' },
      { label: 'Normal', range: '1000-1025 hPa', description: 'Typical conditions. Standard pressure is 1013.25 hPa.' },
      { label: 'High', range: 'Above 1025 hPa', description: 'Usually indicates clear skies, calm winds, and fair weather.' },
    ],
    practicalTips: [
      'A rapid pressure drop (more than 5 hPa in 3 hours) often means a storm is approaching fast.',
      'Some people experience headaches or joint pain when pressure changes rapidly.',
      'Pilots and hikers use altimeters (pressure-based) — always calibrate to current conditions.',
      'Barometric pressure trends matter more than absolute values for weather forecasting.',
    ],
  },
  'wind': {
    id: 'wind',
    name: 'Wind',
    brief: 'The movement of air from areas of high pressure to low pressure. Speed is measured in mph and direction indicates where the wind is blowing from.',
    detailed: 'Wind is caused by differences in atmospheric pressure — air flows from high-pressure areas to low-pressure areas. The greater the pressure difference (pressure gradient), the stronger the wind. The Coriolis effect (Earth\'s rotation) curves wind patterns, creating the large-scale circulation patterns that drive global weather. Wind direction is reported as where the wind comes FROM — a "north wind" blows from north to south. Wind speed and gusts are different: sustained speed is the average over 2 minutes, while gusts are brief surges lasting 3-5 seconds.',
    howMeasured: 'Wind speed is measured by an anemometer (rotating cups or ultrasonic sensors). Direction is measured by a wind vane. Modern weather stations sample wind data every second, reporting 2-minute sustained averages and peak gusts. The Beaufort Scale (0-12) classifies wind by its observable effects, from calm smoke to hurricane-force destruction.',
    ranges: [
      { label: 'Calm', range: '0-5 mph', description: 'Smoke rises vertically. Leaves barely move.' },
      { label: 'Breezy', range: '5-15 mph', description: 'Leaves rustle, flags flutter. Pleasant for outdoor activities.' },
      { label: 'Windy', range: '15-30 mph', description: 'Small branches move, dust blows. Difficult to use an umbrella.' },
      { label: 'High Wind', range: '30-50 mph', description: 'Large branches sway, walking is difficult. Secure loose objects.' },
      { label: 'Dangerous', range: '50+ mph', description: 'Structural damage possible. Stay indoors and away from windows.' },
    ],
    practicalTips: [
      'Wind chill makes cold days feel colder — a 30°F day with 20 mph wind feels like 17°F.',
      'For cycling or running, headwinds above 15 mph significantly increase effort.',
      'Wind gusts can be 30-50% stronger than sustained speeds — prepare for the gust, not just the average.',
      'Wind direction shifts often signal a weather front passing through your area.',
    ],
  },
  'visibility': {
    id: 'visibility',
    name: 'Visibility',
    brief: 'The maximum distance at which objects can be clearly seen, affected by fog, rain, snow, haze, smoke, and other atmospheric conditions.',
    detailed: 'Visibility measures how far you can see and identify objects or landmarks. In perfect conditions, visibility can exceed 100 miles, but it\'s commonly limited by water droplets (fog, rain), ice crystals (snow), dust, smoke, pollution, or haze. Visibility is critical for aviation, marine navigation, and driving safety. Dense fog reduces visibility below 1/4 mile, while light haze might limit it to 5-6 miles. Urban areas typically have lower visibility than rural areas due to pollution particles.',
    howMeasured: 'Historically measured by human observers identifying known landmarks at set distances. Modern automated stations use transmissometers or forward scatter meters — they send a beam of light and measure how much is scattered or absorbed by particles in the air. Reported in miles (US) or kilometers (international).',
    ranges: [
      { label: 'Clear', range: '10+ miles', description: 'Excellent visibility. No significant obstructions.' },
      { label: 'Moderate', range: '5-10 miles', description: 'Good visibility with slight haze. Normal conditions.' },
      { label: 'Low', range: '1-5 miles', description: 'Reduced by haze, light rain, or mist. Drive with caution.' },
      { label: 'Poor', range: 'Below 1 mile', description: 'Fog, heavy rain, or snow. Use low-beam headlights. Slow down.' },
    ],
    practicalTips: [
      'Fog is most common in early morning — visibility usually improves as the sun heats the air.',
      'Use low-beam headlights in low visibility — high beams reflect off fog and make it worse.',
      'Airports delay or cancel flights when visibility drops below minimums (typically 1/2 to 1 mile).',
      'Mountain passes and valleys are fog-prone due to cold air pooling and temperature inversions.',
    ],
  },
  'feels-like': {
    id: 'feels-like',
    name: 'Feels Like',
    brief: 'The apparent temperature your body actually perceives, calculated by combining the real temperature with wind chill (in cold) or heat index (in heat).',
    detailed: 'The "feels like" temperature (apparent temperature) represents how hot or cold it actually feels to the human body. In cold weather, wind strips heat from exposed skin faster than still air — this is wind chill. In hot weather, high humidity prevents sweat from evaporating efficiently, making it feel hotter — this is the heat index. The feels-like temperature can differ from the actual temperature by 10-20 degrees or more in extreme conditions.',
    howMeasured: 'Calculated using two formulas depending on conditions. Wind Chill Index (used below 50°F with wind above 3 mph) factors in air temperature and wind speed. Heat Index (used above 80°F with humidity above 40%) factors in air temperature and relative humidity. Some services use the Australian "apparent temperature" model that combines both into a single formula.',
    ranges: [
      { label: 'Much Cooler', range: '10°+ below actual', description: 'Strong wind chill effect. Frostbite risk increases.' },
      { label: 'Slightly Cooler', range: '1-10° below actual', description: 'Mild wind chill. Dress one layer warmer than the thermometer suggests.' },
      { label: 'Same', range: 'Within 1° of actual', description: 'Calm conditions. The thermometer matches what you feel.' },
      { label: 'Slightly Warmer', range: '1-10° above actual', description: 'Humidity making it feel warmer. Stay hydrated.' },
      { label: 'Much Warmer', range: '10°+ above actual', description: 'Dangerous heat index. Heat exhaustion and stroke risk.' },
    ],
    practicalTips: [
      'Dress for the "feels like" temperature, not the actual temperature.',
      'A heat index above 105°F is dangerous — limit outdoor exertion and stay hydrated.',
      'Wind chill below -20°F can cause frostbite on exposed skin in under 30 minutes.',
      'Humidity is the biggest factor in summer discomfort — a dry 95°F feels better than a humid 85°F.',
    ],
  },
  'precipitation': {
    id: 'precipitation',
    name: 'Precipitation',
    brief: 'The total amount of water (rain, snow, sleet, or hail) that has fallen in the last 24 hours, measured in inches.',
    detailed: 'Precipitation is any form of water — liquid or frozen — that falls from clouds and reaches the ground. This includes rain, drizzle, snow, sleet, freezing rain, and hail. The 24-hour accumulation total tells you how much water has fallen recently. Snow is measured separately and then converted — roughly 10-13 inches of snow equals 1 inch of liquid water, though this ratio varies with temperature. Precipitation is the key driver of floods, drought cycles, agriculture, and water supply management.',
    howMeasured: 'Measured with rain gauges — simple collectors that funnel water into a graduated cylinder. Tipping bucket gauges automatically record each 0.01 inch increment. Snow is measured with snow boards (flat surfaces) and snow depth rulers. Radar estimates precipitation over wide areas by measuring the reflectivity of water droplets in the atmosphere (dBZ values).',
    ranges: [
      { label: 'None', range: '0.00"', description: 'No precipitation recorded in the last 24 hours.' },
      { label: 'Light', range: '0.01-0.10"', description: 'Light rain or drizzle. Minimal impact on activities.' },
      { label: 'Moderate', range: '0.10-0.50"', description: 'Steady rain. Roads may be wet. Bring an umbrella.' },
      { label: 'Heavy', range: '0.50-1.00"', description: 'Heavy rain. Possible street flooding in low areas.' },
      { label: 'Very Heavy', range: '1.00"+', description: 'Significant rainfall. Flash flood risk. Monitor warnings.' },
    ],
    practicalTips: [
      'Flash flooding can occur with as little as 1 inch of rain per hour on saturated ground.',
      'Freezing rain (rain that freezes on contact) is the most dangerous winter precipitation for travel.',
      'Check 24-hour totals before hiking — trails can be dangerously slippery after 0.25" or more.',
      'Snow-to-liquid ratios vary: fluffy cold snow might be 20:1, while heavy wet snow can be 5:1.',
    ],
  },
  'pollen': {
    id: 'pollen',
    name: 'Pollen Count',
    brief: 'The concentration of airborne pollen grains from trees, grasses, and weeds, indicating allergy risk levels for sensitive individuals.',
    detailed: 'Pollen counts measure the number of pollen grains per cubic meter of air. Trees, grasses, and weeds each have distinct pollination seasons — trees peak in spring, grasses in late spring/early summer, and weeds (especially ragweed) in late summer/fall. Pollen is a fine powder released by plants for reproduction, and it triggers allergic reactions (hay fever) in roughly 20-30% of the population. Wind-pollinated plants produce the most airborne pollen, while insect-pollinated plants (like roses) rarely cause allergies.',
    howMeasured: 'Collected using volumetric air samplers (Rotorod or Burkard traps) that capture airborne particles on sticky surfaces. Trained analysts count and identify pollen grains under a microscope. Modern laser-based sensors can provide real-time automated counts. Results are reported by category (tree, grass, weed) and by specific species when possible.',
    ranges: [
      { label: 'None', range: '0', description: 'No pollen detected. Allergy-free conditions.' },
      { label: 'Very Low', range: '1-20', description: 'Minimal pollen. Most allergy sufferers unaffected.' },
      { label: 'Low', range: '20-50', description: 'Low levels. Mildly sensitive individuals may notice symptoms.' },
      { label: 'Moderate', range: '50-150', description: 'Many allergy sufferers will experience symptoms.' },
      { label: 'High', range: '150-500', description: 'Most allergy sufferers affected. Limit outdoor time.' },
      { label: 'Very High', range: '500+', description: 'Extremely high. Even non-allergic individuals may react.' },
    ],
    practicalTips: [
      'Pollen counts are highest in the morning (5-10 AM) — schedule outdoor activities for afternoon.',
      'Rain washes pollen out of the air — the best time to go outside is right after rain.',
      'Keep car and home windows closed during high pollen days. Use HEPA filters indoors.',
      'Shower and change clothes after being outside to remove pollen from skin and hair.',
    ],
  },
  'sun-times': {
    id: 'sun-times',
    name: 'Sun Times',
    brief: 'The exact times of sunrise and sunset for your location, determined by Earth\'s rotation, your latitude, and the time of year.',
    detailed: 'Sunrise and sunset times are calculated based on the moment the sun\'s upper edge crosses the horizon. These times change daily due to Earth\'s axial tilt (23.5°) and its elliptical orbit around the sun. Near the equinoxes (March and September), day and night are roughly equal worldwide. Near the solstices, the difference is extreme — at the Arctic Circle, the sun doesn\'t set in midsummer or rise in midwinter. Twilight (civil, nautical, astronomical) extends usable light 20-90 minutes beyond sunrise/sunset.',
    howMeasured: 'Calculated using astronomical algorithms based on your geographic coordinates (latitude/longitude), the date, and the sun\'s declination angle. The computation accounts for atmospheric refraction — the bending of sunlight through the atmosphere makes the sun appear to rise about 2 minutes earlier and set about 2 minutes later than geometric calculations predict.',
    ranges: [
      { label: 'Short Days', range: '< 10 hours', description: 'Winter months at mid/high latitudes. Less daylight for outdoor activities.' },
      { label: 'Equinox', range: '~12 hours', description: 'Near-equal day and night. Occurs around March 20 and September 22.' },
      { label: 'Long Days', range: '> 14 hours', description: 'Summer months. Extended daylight for recreation and solar energy.' },
    ],
    practicalTips: [
      'Golden hour (first/last hour of sunlight) provides the best light for photography.',
      'Plan hikes to start 30 minutes after sunrise for the best trail visibility and cool temperatures.',
      'Solar panels are most efficient during the longest days — peak production is near the summer solstice.',
      'Daylight duration shifts by about 2 minutes per day near equinoxes, but nearly 0 near solstices.',
    ],
  },
  'moon-phase': {
    id: 'moon-phase',
    name: 'Moon Phase',
    brief: 'The current shape of the moon\'s illuminated portion as seen from Earth, cycling through 8 phases over approximately 29.5 days.',
    detailed: 'The moon doesn\'t produce its own light — it reflects sunlight. As the moon orbits Earth, the angle between the sun, Earth, and moon changes, creating the familiar cycle of phases. The cycle begins with the New Moon (invisible), grows through Waxing Crescent, First Quarter, and Waxing Gibbous to the Full Moon, then shrinks through Waning Gibbous, Third Quarter, and Waning Crescent back to New Moon. The complete cycle (synodic month) takes 29.53 days. Moon phases affect ocean tides, nocturnal wildlife activity, and night sky visibility for stargazing.',
    howMeasured: 'Calculated using the moon\'s orbital position relative to the sun and Earth (ecliptic longitude difference). Illumination percentage indicates how much of the moon\'s Earth-facing surface is lit. Ephemeris tables and astronomical algorithms predict phases with extreme precision — they can be calculated centuries in advance.',
    ranges: [
      { label: 'New Moon', range: '0% illuminated', description: 'Moon is between Earth and sun. Invisible. Best for stargazing.' },
      { label: 'Crescent', range: '1-49%', description: 'Thin sliver visible. Waxing (growing) or waning (shrinking).' },
      { label: 'Quarter', range: '50%', description: 'Half the moon is lit. First quarter (right half) or third quarter (left half).' },
      { label: 'Gibbous', range: '51-99%', description: 'Most of the moon is lit. Bright nights.' },
      { label: 'Full Moon', range: '100%', description: 'Fully illuminated. Strongest tidal effects. Bright nights.' },
    ],
    practicalTips: [
      'Plan stargazing and astrophotography around the New Moon for the darkest skies.',
      'Full moons rise at sunset and set at sunrise — useful for nighttime outdoor activities.',
      'Tides are strongest (spring tides) during Full and New Moons due to sun-moon gravitational alignment.',
      'The moon rises about 50 minutes later each day as it moves through its orbit.',
    ],
  },
}

/** Get a metric definition by ID. Returns undefined if not found. */
export function getMetricDefinition(id: string): WeatherMetricDefinition | undefined {
  return WEATHER_METRICS[id]
}

/** Get all metric definitions as an ordered array. */
export function getAllMetrics(): WeatherMetricDefinition[] {
  return Object.values(WEATHER_METRICS)
}
