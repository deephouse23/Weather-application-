export const cityData: { [key: string]: { 
  name: string
  state: string
  searchTerm: string
  title: string
  description: string
  content: {
    intro: string
    climate: string
    patterns: string
  }
}} = {
  'new-york-ny': {
    name: 'New York',
    state: 'NY',
    searchTerm: 'New York, NY',
    title: 'New York Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for New York, NY. Real-time weather data with retro terminal aesthetics. Check temperature, humidity, wind, and more.',
    content: {
      intro: 'New York City experiences a humid subtropical climate with four distinct seasons. Located in the northeastern United States, the city\'s weather is influenced by its coastal position and urban heat island effect.',
      climate: 'Summers in NYC are typically hot and humid with average highs in the mid-80s°F (29°C), while winters are cold with temperatures often dropping below freezing. The city receives about 50 inches of precipitation annually, distributed fairly evenly throughout the year.',
      patterns: 'Weather patterns in New York are heavily influenced by the Atlantic Ocean and can change rapidly. The city experiences everything from nor\'easters in winter to thunderstorms and occasional heat waves in summer. Spring and fall offer the most pleasant weather conditions.'
    }
  },
  'los-angeles-ca': {
    name: 'Los Angeles',
    state: 'CA',
    searchTerm: 'Los Angeles, CA',
    title: 'Los Angeles Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Los Angeles, CA. Real-time weather data with retro terminal aesthetics. Check temperature, humidity, wind, and more.',
    content: {
      intro: 'Los Angeles enjoys a Mediterranean climate characterized by warm, dry summers and mild, wet winters. The city\'s location along the Pacific coast and surrounded by mountains creates diverse microclimates throughout the region.',
      climate: 'Summer temperatures typically range from the mid-70s to mid-80s°F (24-29°C) with very low humidity and minimal rainfall. Winters are mild with highs in the 60s-70s°F (15-21°C) and most of the year\'s 15 inches of rainfall occurring between November and March.',
      patterns: 'LA\'s weather is notably stable and predictable, with over 280 sunny days per year. The marine layer from the Pacific often creates morning fog and clouds that burn off by afternoon. Santa Ana winds occasionally bring hot, dry conditions and elevated fire risk.'
    }
  },
  'chicago-il': {
    name: 'Chicago',
    state: 'IL',
    searchTerm: 'Chicago, IL',
    title: 'Chicago Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Chicago, IL. Real-time weather data with retro terminal aesthetics. Check temperature, humidity, wind, and more.',
    content: {
      intro: 'Chicago experiences a continental climate with hot, humid summers and cold, snowy winters. The city\'s location on Lake Michigan significantly influences its weather patterns, moderating temperatures and increasing precipitation.',
      climate: 'Summer highs average in the low 80s°F (27°C) with high humidity, while winter temperatures often drop below freezing with average lows around 20°F (-7°C). The city receives about 38 inches of precipitation annually, including significant snowfall in winter.',
      patterns: 'Lake Michigan creates a \