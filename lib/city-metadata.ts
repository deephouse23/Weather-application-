/**
 * City Metadata for SEO
 * 
 * Contains unique, keyword-rich content for major US cities.
 * Used by generateMetadata in city weather pages for SEO optimization.
 */

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
  // TOP 10 CITIES (Full content)
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
      patterns: 'Lake Michigan creates a significant "lake effect" that moderates temperatures year-round but can produce heavy snow in winter. The city experiences rapid weather changes due to its location in the path of many storm systems moving across the Great Plains. Summers can bring severe thunderstorms, while winters feature blizzards and frigid Arctic air masses.'
    }
  },
  'houston-tx': {
    name: 'Houston',
    state: 'TX',
    searchTerm: 'Houston, TX',
    title: 'Houston Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Houston, TX. Real-time weather data including humidity levels, Gulf Coast storm tracking, and hurricane season updates.',
    content: {
      intro: 'Houston has a humid subtropical climate with hot, humid summers and mild winters. Located near the Gulf of Mexico, the city experiences high humidity year-round and is prone to tropical weather systems during hurricane season.',
      climate: 'Summer temperatures regularly reach the 90s°F (32-37°C) with very high humidity making it feel even hotter. Winters are mild with highs in the 60s-70s°F (15-21°C). The city receives about 50 inches of rain annually, much of it from thunderstorms and tropical systems.',
      patterns: 'Houston\'s weather is dominated by Gulf moisture creating frequent afternoon and evening thunderstorms during summer. The city is vulnerable to hurricanes and tropical storms from June through November. Flash flooding is a significant concern during heavy rain events.'
    }
  },
  'phoenix-az': {
    name: 'Phoenix',
    state: 'AZ',
    searchTerm: 'Phoenix, AZ',
    title: 'Phoenix Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Phoenix, AZ. Real-time desert weather data including extreme heat warnings, monsoon tracking, and dust storm alerts.',
    content: {
      intro: 'Phoenix has a hot desert climate with extremely hot summers and mild winters. Located in the Sonoran Desert, the city experiences low humidity year-round and abundant sunshine with minimal precipitation.',
      climate: 'Summer temperatures routinely exceed 110°F (43°C) from May through September, making Phoenix one of the hottest major cities in the US. Winters are pleasant with highs in the 70s°F (21°C). Annual rainfall is only about 8 inches, mostly from winter storms and summer monsoons.',
      patterns: 'Phoenix weather is characterized by extreme heat and drought, broken by the North American Monsoon which brings thunderstorms, flash flooding, and dust storms (haboobs) from July through September. Winter months offer ideal outdoor weather conditions.'
    }
  },
  'philadelphia-pa': {
    name: 'Philadelphia',
    state: 'PA',
    searchTerm: 'Philadelphia, PA',
    title: 'Philadelphia Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Philadelphia, PA. Real-time weather data with four-season tracking and nor\'easter alerts.',
    content: {
      intro: 'Philadelphia has a humid subtropical climate with hot, humid summers and cool to cold winters. Located in southeastern Pennsylvania, the city experiences four distinct seasons with moderate precipitation throughout the year.',
      climate: 'Summer highs average in the mid-80s°F (29°C) with high humidity, while winter temperatures typically range from the 20s to 40s°F (-7 to 4°C). The city receives about 42 inches of precipitation annually, including snow in winter months.',
      patterns: 'Philadelphia\'s weather is influenced by both continental and maritime air masses, creating variable conditions. The city can experience nor\'easters, thunderstorms, and occasional severe weather. Spring and fall provide the most comfortable weather.'
    }
  },
  'san-antonio-tx': {
    name: 'San Antonio',
    state: 'TX',
    searchTerm: 'San Antonio, TX',
    title: 'San Antonio Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for San Antonio, TX. Real-time South Texas weather data with humidity and severe weather tracking.',
    content: {
      intro: 'San Antonio has a humid subtropical climate with hot summers and mild winters. Located in south-central Texas, the city experiences warm weather year-round with moderate to high humidity.',
      climate: 'Summer temperatures regularly reach the 90s-100s°F (32-38°C) with moderate humidity. Winters are mild with highs typically in the 60s°F (15°C) and lows rarely dropping below freezing. Annual precipitation is about 30 inches.',
      patterns: 'San Antonio\'s weather features long, hot summers and short, mild winters. The city occasionally experiences severe thunderstorms and is within range of Gulf hurricanes. Spring brings variable weather with tornado potential.'
    }
  },
  'san-diego-ca': {
    name: 'San Diego',
    state: 'CA',
    searchTerm: 'San Diego, CA',
    title: 'San Diego Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for San Diego, CA. Real-time coastal California weather with marine layer and beach conditions.',
    content: {
      intro: 'San Diego boasts a semi-arid Mediterranean climate with mild temperatures year-round. Located on the Pacific coast of Southern California, the city enjoys one of the most stable and pleasant climates in the United States.',
      climate: 'Temperatures are remarkably consistent, with summer highs in the mid-70s°F (24°C) and winter highs in the mid-60s°F (18°C). Humidity is generally low, and the city receives only about 10 inches of rain annually, mostly during winter months.',
      patterns: 'San Diego\'s weather is dominated by marine influence, creating cool ocean breezes and preventing extreme temperatures. "June Gloom" brings marine layer clouds in late spring and early summer. Fire weather conditions can develop during Santa Ana wind events.'
    }
  },
  'dallas-tx': {
    name: 'Dallas',
    state: 'TX',
    searchTerm: 'Dallas, TX',
    title: 'Dallas Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Dallas, TX. Real-time North Texas weather with severe storm and tornado tracking.',
    content: {
      intro: 'Dallas has a humid subtropical climate with hot summers and mild winters. Located in north-central Texas, the city experiences a continental climate influence with variable weather patterns and is in the heart of Tornado Alley.',
      climate: 'Summer temperatures frequently reach the 90s-100s°F (32-38°C) with moderate to high humidity. Winters are generally mild with highs in the 50s-60s°F (10-15°C), though occasional cold fronts can bring freezing temperatures. Annual precipitation is about 37 inches.',
      patterns: 'Dallas weather is characterized by hot summers, mild winters, and rapid weather changes. The city can experience severe thunderstorms, tornadoes, hail, and occasional ice storms. Spring is the most active severe weather season.'
    }
  },
  'austin-tx': {
    name: 'Austin',
    state: 'TX',
    searchTerm: 'Austin, TX',
    title: 'Austin Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Austin, TX. Real-time Central Texas weather with flash flood and severe storm tracking.',
    content: {
      intro: 'Austin has a humid subtropical climate with hot summers and mild winters. Located in the Texas Hill Country, the city experiences warm weather most of the year with distinct wet and dry seasons and is prone to flash flooding.',
      climate: 'Summer temperatures regularly exceed 95°F (35°C) with moderate humidity, while winters are mild with highs in the 60s°F (15°C) and lows rarely below freezing. The city receives about 34 inches of rain annually, with peak rainfall in spring and fall.',
      patterns: 'Austin\'s weather features long, hot summers and short, mild winters. The city experiences severe thunderstorms, flash flooding along creeks, and occasional tornadoes. Spring brings wildflower blooms and variable weather conditions.'
    }
  },
  // CITIES 11-25 (Medium content)
  'miami-fl': {
    name: 'Miami',
    state: 'FL',
    searchTerm: 'Miami, FL',
    title: 'Miami Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Miami, FL. Real-time tropical weather data with hurricane tracking and beach conditions.',
    content: {
      intro: 'Miami has a tropical monsoon climate with hot, humid summers and warm, dry winters. The city is heavily influenced by the Atlantic Ocean and Gulf Stream.',
      climate: 'Summer temperatures reach the upper 80s-90s°F (31-33°C) with very high humidity. Winters are warm with highs in the 70s°F (21-26°C). Annual rainfall exceeds 60 inches, mostly during the wet season from May to October.',
      patterns: 'Miami experiences daily afternoon thunderstorms in summer and is vulnerable to hurricanes from June through November. Sea breezes moderate temperatures year-round.'
    }
  },
  'atlanta-ga': {
    name: 'Atlanta',
    state: 'GA',
    searchTerm: 'Atlanta, GA',
    title: 'Atlanta Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Atlanta, GA. Real-time weather data for the Southeast hub with severe storm tracking.',
    content: {
      intro: 'Atlanta has a humid subtropical climate with hot summers and mild winters. Located in the Piedmont region of Georgia, the city experiences four seasons with occasional severe weather.',
      climate: 'Summer highs reach the upper 80s-90s°F (31-33°C) with high humidity. Winters are mild with occasional cold snaps. The city receives about 50 inches of rain annually.',
      patterns: 'Atlanta experiences severe thunderstorms and occasional tornadoes in spring. Ice storms can impact the city in winter. Summer brings frequent afternoon thunderstorms.'
    }
  },
  'denver-co': {
    name: 'Denver',
    state: 'CO',
    searchTerm: 'Denver, CO',
    title: 'Denver Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Denver, CO. Real-time Mile High City weather with mountain snow and hail tracking.',
    content: {
      intro: 'Denver has a semi-arid continental climate with four distinct seasons. Located at the base of the Rocky Mountains at 5,280 feet elevation, the city experiences variable weather and low humidity.',
      climate: 'Summers are warm with highs in the 80s-90s°F (27-32°C) but low humidity. Winters are cold but sunny, with highs in the 40s°F (4-9°C). The city receives about 15 inches of precipitation annually, including significant snow.',
      patterns: 'Denver experiences rapid weather changes due to its mountain proximity. Chinook winds can raise temperatures 40°F in hours. Spring brings heavy snow and severe thunderstorms with large hail.'
    }
  },
  'seattle-wa': {
    name: 'Seattle',
    state: 'WA',
    searchTerm: 'Seattle, WA',
    title: 'Seattle Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Seattle, WA. Real-time Pacific Northwest weather with rain tracking and mountain conditions.',
    content: {
      intro: 'Seattle has an oceanic climate with mild, wet winters and warm, dry summers. Protected by the Olympic Mountains, the city receives less rain than its reputation suggests.',
      climate: 'Summers are pleasant with highs in the 70s°F (21-26°C) and minimal rain. Winters are mild with highs in the 40s°F (4-9°C) and frequent light rain. Annual precipitation is about 37 inches.',
      patterns: 'Seattle experiences persistent cloud cover in winter but enjoys sunny, dry summers. The "Seattle Freeze" of gray winter days contrasts with beautiful summer weather.'
    }
  },
  'san-francisco-ca': {
    name: 'San Francisco',
    state: 'CA',
    searchTerm: 'San Francisco, CA',
    title: 'San Francisco Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for San Francisco, CA. Real-time Bay Area weather with fog tracking and microclimate data.',
    content: {
      intro: 'San Francisco has a Mediterranean climate strongly influenced by cold ocean currents. The city is famous for its fog and cool summers, with distinct microclimates across neighborhoods.',
      climate: 'Temperatures are remarkably stable year-round, typically between 50-70°F (10-21°C). Summer can be foggy and cool, while fall offers the warmest weather. Annual rainfall is about 23 inches.',
      patterns: 'The famous fog rolls in through the Golden Gate, cooling western neighborhoods while eastern areas stay warm. Karl the Fog is most common in summer mornings.'
    }
  },
  'boston-ma': {
    name: 'Boston',
    state: 'MA',
    searchTerm: 'Boston, MA',
    title: 'Boston Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Boston, MA. Real-time New England weather with nor\'easter and snowstorm tracking.',
    content: {
      intro: 'Boston has a humid continental climate with cold winters and warm summers. The city\'s coastal location influences its weather, bringing ocean breezes and nor\'easters.',
      climate: 'Summers are warm with highs in the 80s°F (27-29°C). Winters are cold with temperatures often below freezing and significant snowfall. Annual precipitation is about 44 inches.',
      patterns: 'Boston experiences nor\'easters bringing heavy snow in winter and occasional hurricanes in fall. The city sees rapid weather changes due to its New England location.'
    }
  },
  'las-vegas-nv': {
    name: 'Las Vegas',
    state: 'NV',
    searchTerm: 'Las Vegas, NV',
    title: 'Las Vegas Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Las Vegas, NV. Real-time desert weather with extreme heat warnings and monsoon tracking.',
    content: {
      intro: 'Las Vegas has a hot desert climate similar to Phoenix but at a slightly higher elevation. The city experiences extreme heat in summer and mild winters.',
      climate: 'Summer temperatures frequently exceed 100°F (38°C) with very low humidity. Winters are mild with highs in the 50s-60s°F (10-15°C). Annual rainfall is only about 4 inches.',
      patterns: 'Las Vegas experiences extreme heat from May through September. Summer monsoons can bring flash flooding. Winter occasionally sees snow on surrounding mountains.'
    }
  },
  'portland-or': {
    name: 'Portland',
    state: 'OR',
    searchTerm: 'Portland, OR',
    title: 'Portland Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Portland, OR. Real-time Pacific Northwest weather with rain and river tracking.',
    content: {
      intro: 'Portland has an oceanic climate with wet winters and warm, dry summers. The city sits at the confluence of the Willamette and Columbia rivers.',
      climate: 'Summers are warm and dry with highs in the 80s°F (27-29°C). Winters are mild and wet with highs in the 40s°F (4-7°C). Annual rainfall is about 43 inches.',
      patterns: 'Portland experiences persistent rain from October through June, with dry summers. Occasional ice storms occur in winter. Summer heat waves have become more common.'
    }
  },
  'nashville-tn': {
    name: 'Nashville',
    state: 'TN',
    searchTerm: 'Nashville, TN',
    title: 'Nashville Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Nashville, TN. Real-time Music City weather with severe storm and flood tracking.',
    content: {
      intro: 'Nashville has a humid subtropical climate with hot summers and mild winters. Located in the Cumberland River valley, the city is prone to flooding.',
      climate: 'Summer highs reach the 90s°F (32-35°C) with high humidity. Winters are mild with occasional snow and ice. Annual precipitation is about 47 inches.',
      patterns: 'Nashville experiences severe thunderstorms and tornadoes in spring. Flash flooding is a significant risk. Ice storms occasionally impact winter travel.'
    }
  },
  'minneapolis-mn': {
    name: 'Minneapolis',
    state: 'MN',
    searchTerm: 'Minneapolis, MN',
    title: 'Minneapolis Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Minneapolis, MN. Real-time Twin Cities weather with winter storm and severe weather tracking.',
    content: {
      intro: 'Minneapolis has a humid continental climate with extreme temperature variations. The city experiences very cold winters and warm summers.',
      climate: 'Summer highs reach the 80s°F (27-29°C). Winters are extremely cold with average highs in the teens°F (-7 to -12°C). Annual snowfall exceeds 50 inches.',
      patterns: 'Minneapolis experiences Arctic outbreaks in winter with temperatures dropping below -20°F. Severe thunderstorms and tornadoes occur in spring and summer.'
    }
  },
  // CITIES 26-50 (Concise content)
  'orlando-fl': {
    name: 'Orlando',
    state: 'FL',
    searchTerm: 'Orlando, FL',
    title: 'Orlando Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Orlando, FL. Real-time Central Florida weather with theme park conditions and afternoon storm tracking.',
    content: {
      intro: 'Orlando has a humid subtropical climate with hot summers and mild winters. Daily afternoon thunderstorms are common in summer.',
      climate: 'Summers are hot and humid with daily thunderstorms. Winters are mild and dry with highs in the 70s°F (21-24°C).',
      patterns: 'Afternoon thunderstorms occur almost daily from June through September. Hurricanes can impact the area.'
    }
  },
  'tampa-fl': {
    name: 'Tampa',
    state: 'FL',
    searchTerm: 'Tampa, FL',
    title: 'Tampa Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Tampa, FL. Real-time Tampa Bay weather with lightning and hurricane tracking.',
    content: {
      intro: 'Tampa has a humid subtropical climate and is known as the lightning capital of North America during summer.',
      climate: 'Hot, humid summers with frequent lightning storms. Mild winters rarely see frost.',
      patterns: 'Daily thunderstorms in summer, especially along sea breeze boundaries. Hurricane-prone during Atlantic season.'
    }
  },
  'detroit-mi': {
    name: 'Detroit',
    state: 'MI',
    searchTerm: 'Detroit, MI',
    title: 'Detroit Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Detroit, MI. Real-time Motor City weather with lake effect snow tracking.',
    content: {
      intro: 'Detroit has a humid continental climate influenced by the Great Lakes. Lake effect can enhance precipitation.',
      climate: 'Cold winters with significant snow. Warm, humid summers with thunderstorms.',
      patterns: 'Lake effect enhances winter snow and summer storms. Arctic outbreaks bring extreme cold.'
    }
  },
  'cleveland-oh': {
    name: 'Cleveland',
    state: 'OH',
    searchTerm: 'Cleveland, OH',
    title: 'Cleveland Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Cleveland, OH. Real-time Lake Erie weather with lake effect snow alerts.',
    content: {
      intro: 'Cleveland has a humid continental climate with significant lake effect from Lake Erie.',
      climate: 'Cold, snowy winters with lake effect enhancement. Warm summers with lake breezes.',
      patterns: 'Heavy lake effect snow in fall and winter. Summer storms can be enhanced by lake moisture.'
    }
  },
  'indianapolis-in': {
    name: 'Indianapolis',
    state: 'IN',
    searchTerm: 'Indianapolis, IN',
    title: 'Indianapolis Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Indianapolis, IN. Real-time Indiana weather with severe storm tracking.',
    content: {
      intro: 'Indianapolis has a humid continental climate with four distinct seasons and variable weather.',
      climate: 'Hot, humid summers. Cold winters with moderate snow. Spring and fall are pleasant but changeable.',
      patterns: 'Severe thunderstorms and occasional tornadoes in spring. Winter ice storms can occur.'
    }
  },
  'columbus-oh': {
    name: 'Columbus',
    state: 'OH',
    searchTerm: 'Columbus, OH',
    title: 'Columbus Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Columbus, OH. Real-time Central Ohio weather data.',
    content: {
      intro: 'Columbus has a humid continental climate with hot summers and cold winters typical of the Midwest.',
      climate: 'Hot, humid summers with frequent thunderstorms. Cold winters with moderate snowfall.',
      patterns: 'Severe weather possible in spring. Variable weather patterns common throughout the year.'
    }
  },
  'charlotte-nc': {
    name: 'Charlotte',
    state: 'NC',
    searchTerm: 'Charlotte, NC',
    title: 'Charlotte Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Charlotte, NC. Real-time Piedmont weather with severe storm tracking.',
    content: {
      intro: 'Charlotte has a humid subtropical climate with hot summers and mild winters.',
      climate: 'Hot, humid summers. Mild winters with occasional snow and ice. Pleasant spring and fall.',
      patterns: 'Severe thunderstorms in spring and summer. Winter ice storms can cause significant disruption.'
    }
  },
  'baltimore-md': {
    name: 'Baltimore',
    state: 'MD',
    searchTerm: 'Baltimore, MD',
    title: 'Baltimore Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Baltimore, MD. Real-time Chesapeake Bay area weather.',
    content: {
      intro: 'Baltimore has a humid subtropical climate influenced by the Chesapeake Bay.',
      climate: 'Hot, humid summers. Cold winters with variable precipitation including snow, sleet, and freezing rain.',
      patterns: 'Nor\'easters can bring significant snow. Summer thunderstorms are common.'
    }
  },
  'milwaukee-wi': {
    name: 'Milwaukee',
    state: 'WI',
    searchTerm: 'Milwaukee, WI',
    title: 'Milwaukee Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Milwaukee, WI. Real-time Lake Michigan weather with winter storm tracking.',
    content: {
      intro: 'Milwaukee has a humid continental climate strongly influenced by Lake Michigan.',
      climate: 'Cold winters with lake effect snow. Warm summers moderated by lake breezes.',
      patterns: 'Lake effect enhances winter snow. Arctic outbreaks bring dangerous cold.'
    }
  },
  'kansas-city-mo': {
    name: 'Kansas City',
    state: 'MO',
    searchTerm: 'Kansas City, MO',
    title: 'Kansas City Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Kansas City, MO. Real-time weather with severe storm and tornado tracking.',
    content: {
      intro: 'Kansas City has a humid continental climate with hot summers and cold winters in Tornado Alley.',
      climate: 'Hot, humid summers with severe weather. Cold winters with ice and snow.',
      patterns: 'Severe thunderstorms and tornadoes in spring. Rapid temperature changes from Arctic fronts.'
    }
  },
  'salt-lake-city-ut': {
    name: 'Salt Lake City',
    state: 'UT',
    searchTerm: 'Salt Lake City, UT',
    title: 'Salt Lake City Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Salt Lake City, UT. Real-time weather with ski conditions and inversions.',
    content: {
      intro: 'Salt Lake City has a semi-arid continental climate with four seasons and mountain influences.',
      climate: 'Hot, dry summers. Cold winters with significant snow in mountains. Inversions trap cold air.',
      patterns: 'Winter inversions create poor air quality. Lake effect snow from Great Salt Lake.'
    }
  },
  'raleigh-nc': {
    name: 'Raleigh',
    state: 'NC',
    searchTerm: 'Raleigh, NC',
    title: 'Raleigh Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Raleigh, NC. Real-time Triangle area weather.',
    content: {
      intro: 'Raleigh has a humid subtropical climate with hot summers and mild winters.',
      climate: 'Hot, humid summers with afternoon thunderstorms. Mild winters with occasional snow and ice.',
      patterns: 'Winter precipitation often a mix of rain, sleet, and snow. Hurricanes can bring heavy rain.'
    }
  },
  'new-orleans-la': {
    name: 'New Orleans',
    state: 'LA',
    searchTerm: 'New Orleans, LA',
    title: 'New Orleans Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for New Orleans, LA. Real-time Gulf weather with hurricane tracking.',
    content: {
      intro: 'New Orleans has a humid subtropical climate with very hot summers and mild winters near the Gulf.',
      climate: 'Very hot, humid summers with daily thunderstorms. Mild winters rarely see frost.',
      patterns: 'Vulnerable to hurricanes and tropical storms. Flash flooding common in heavy rain.'
    }
  },
  'virginia-beach-va': {
    name: 'Virginia Beach',
    state: 'VA',
    searchTerm: 'Virginia Beach, VA',
    title: 'Virginia Beach Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Virginia Beach, VA. Real-time beach weather and ocean conditions.',
    content: {
      intro: 'Virginia Beach has a humid subtropical climate moderated by the Atlantic Ocean.',
      climate: 'Warm, humid summers. Mild winters with occasional nor\'easters.',
      patterns: 'Nor\'easters can bring coastal flooding. Hurricanes can impact the area.'
    }
  },
  'sacramento-ca': {
    name: 'Sacramento',
    state: 'CA',
    searchTerm: 'Sacramento, CA',
    title: 'Sacramento Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Sacramento, CA. Real-time Central Valley weather.',
    content: {
      intro: 'Sacramento has a Mediterranean climate with hot, dry summers and mild, wet winters.',
      climate: 'Very hot summers with temperatures often exceeding 100°F. Mild, rainy winters. Dense fog in winter.',
      patterns: 'Tule fog can reduce visibility dramatically in winter. Atmospheric rivers bring heavy rain.'
    }
  },
  'pittsburgh-pa': {
    name: 'Pittsburgh',
    state: 'PA',
    searchTerm: 'Pittsburgh, PA',
    title: 'Pittsburgh Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Pittsburgh, PA. Real-time Steel City weather.',
    content: {
      intro: 'Pittsburgh has a humid continental climate with four distinct seasons at the confluence of three rivers.',
      climate: 'Warm, humid summers. Cold winters with significant snowfall. Frequent cloudy days.',
      patterns: 'One of the cloudiest cities in the US. Lake effect can enhance winter precipitation.'
    }
  },
  'st-louis-mo': {
    name: 'St. Louis',
    state: 'MO',
    searchTerm: 'St. Louis, MO',
    title: 'St. Louis Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for St. Louis, MO. Real-time Gateway City weather.',
    content: {
      intro: 'St. Louis has a humid continental climate with hot summers and cold winters near Tornado Alley.',
      climate: 'Hot, humid summers with severe weather potential. Cold winters with ice and snow.',
      patterns: 'Severe thunderstorms and tornadoes possible in spring. Summer heat waves common.'
    }
  },
  'cincinnati-oh': {
    name: 'Cincinnati',
    state: 'OH',
    searchTerm: 'Cincinnati, OH',
    title: 'Cincinnati Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Cincinnati, OH. Real-time Ohio Valley weather.',
    content: {
      intro: 'Cincinnati has a humid continental climate in the Ohio River valley.',
      climate: 'Hot, humid summers. Cold winters with moderate snow. Variable spring and fall.',
      patterns: 'Severe thunderstorms in spring and summer. Winter precipitation varies widely.'
    }
  },
  'honolulu-hi': {
    name: 'Honolulu',
    state: 'HI',
    searchTerm: 'Honolulu, HI',
    title: 'Honolulu Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Honolulu, HI. Real-time Hawaiian weather with trade wind tracking.',
    content: {
      intro: 'Honolulu has a tropical climate with warm temperatures year-round and trade wind breezes.',
      climate: 'Consistent temperatures in the 80s°F (27-29°C) year-round. Two seasons: dry and wet.',
      patterns: 'Trade winds keep conditions pleasant. Kona storms bring rain. Hurricane season June-November.'
    }
  },
  'anchorage-ak': {
    name: 'Anchorage',
    state: 'AK',
    searchTerm: 'Anchorage, AK',
    title: 'Anchorage Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Anchorage, AK. Real-time Alaska weather with aurora conditions.',
    content: {
      intro: 'Anchorage has a subarctic climate with cold winters and mild summers. Daylight varies dramatically by season.',
      climate: 'Cool summers with nearly 20 hours of daylight. Cold winters with short days. Moderate precipitation.',
      patterns: 'Chinook winds can rapidly warm winter temperatures. Summer stays cool due to ocean influence.'
    }
  },
  'san-jose-ca': {
    name: 'San Jose',
    state: 'CA',
    searchTerm: 'San Jose, CA',
    title: 'San Jose Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for San Jose, CA. Real-time Silicon Valley weather.',
    content: {
      intro: 'San Jose has a Mediterranean climate with warm, dry summers and mild, wet winters.',
      climate: 'Warm summers with low humidity. Mild winters with most rain occurring November-March.',
      patterns: 'Protected from coastal fog by mountains. Drought conditions are common.'
    }
  },
  'jacksonville-fl': {
    name: 'Jacksonville',
    state: 'FL',
    searchTerm: 'Jacksonville, FL',
    title: 'Jacksonville Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Jacksonville, FL. Real-time First Coast weather.',
    content: {
      intro: 'Jacksonville has a humid subtropical climate with hot summers and mild winters.',
      climate: 'Hot, humid summers with afternoon thunderstorms. Mild winters occasionally see frost.',
      patterns: 'Afternoon sea breezes moderate summer temperatures. Hurricanes can impact the area.'
    }
  },
  'fort-worth-tx': {
    name: 'Fort Worth',
    state: 'TX',
    searchTerm: 'Fort Worth, TX',
    title: 'Fort Worth Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Fort Worth, TX. Real-time DFW metroplex weather.',
    content: {
      intro: 'Fort Worth shares Dallas\'s climate with hot summers and mild winters in Tornado Alley.',
      climate: 'Hot summers often exceeding 100°F. Mild winters with occasional ice storms.',
      patterns: 'Severe thunderstorms and tornadoes in spring. Rapid temperature changes possible.'
    }
  },
  'albuquerque-nm': {
    name: 'Albuquerque',
    state: 'NM',
    searchTerm: 'Albuquerque, NM',
    title: 'Albuquerque Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Albuquerque, NM. Real-time high desert weather.',
    content: {
      intro: 'Albuquerque has a semi-arid climate with hot summers and cold nights at 5,000 feet elevation.',
      climate: 'Hot days and cool nights in summer. Mild winters with occasional snow. Low humidity.',
      patterns: 'Monsoon thunderstorms in July-August. Large temperature swings between day and night.'
    }
  },
  'tucson-az': {
    name: 'Tucson',
    state: 'AZ',
    searchTerm: 'Tucson, AZ',
    title: 'Tucson Weather Forecast - 16 Bit Weather',
    description: 'Current weather conditions and 5-day forecast for Tucson, AZ. Real-time Sonoran Desert weather.',
    content: {
      intro: 'Tucson has a hot desert climate similar to Phoenix but slightly cooler due to higher elevation.',
      climate: 'Very hot summers with temperatures over 100°F. Mild winters. Monsoon rains in summer.',
      patterns: 'Summer monsoon brings thunderstorms and dust storms. Low humidity most of the year.'
    }
  }
}

// ==========================================================================
// RICH SEO ENRICHMENTS
// Optional per-city marketing content used by the server-rendered city page.
// Cities without an entry here fall back to the intro/climate/patterns copy
// plus auto-generated structure. Flagship cities below should rank well for
// "<city> weather", "<city> climate", "best time to visit <city>" queries.
// ==========================================================================

export interface CitySeoEnrichment {
  /** Climate classification (Köppen or plain-English label). */
  climateType: string
  /** Seasonal breakdown — each string is 1-2 sentences. */
  seasons: {
    spring: string
    summer: string
    fall: string
    winter: string
  }
  /** 12 average monthly high temps in °F, Jan → Dec. */
  monthlyHighs: number[]
  /** 12 average monthly low temps in °F, Jan → Dec. */
  monthlyLows: number[]
  /** Short recommendation of when weather is most pleasant. */
  bestTimeToVisit: string
  /** Notable weather hazards — used as chips in the UI. */
  severeRisks: string[]
  /** Short factoids that differentiate this city from template copy. */
  uniqueFacts: string[]
  /** FAQ questions and answers — powers FAQPage JSON-LD for featured snippets. */
  faqs: { question: string; answer: string }[]
}

export const cityEnrichments: Record<string, CitySeoEnrichment> = {
  'new-york-ny': {
    climateType: 'Humid subtropical (Köppen Cfa)',
    seasons: {
      spring: 'Spring in NYC runs cool and variable — March can still see snow, April brings cherry blossoms, and May warms quickly into the 70s°F. Expect fast-changing conditions as winter storms give way to summer patterns.',
      summer: 'Summers are hot, humid, and sticky with average highs in the mid-80s°F and frequent heat waves pushing into the 90s. Afternoon thunderstorms roll off the Atlantic several times per month.',
      fall: 'Fall is widely considered NYC\'s best weather season. September stays mild, October brings crisp 60°F days and vivid foliage in nearby parks, and November edges toward cold.',
      winter: 'Winter is cold and often raw, with average highs in the 40s°F and lows in the 20s°F. The city averages 28 inches of snow per year, frequently delivered by a single nor\'easter or two.',
    },
    monthlyHighs: [40, 43, 51, 62, 72, 80, 85, 84, 77, 66, 55, 44],
    monthlyLows: [27, 29, 36, 45, 55, 65, 70, 69, 62, 51, 42, 32],
    bestTimeToVisit: 'Mid-September through late October offers the most comfortable weather — warm days, cool nights, low humidity, and fall foliage. Late April through early June is a close second.',
    severeRisks: ['Nor\'easters', 'Heat waves', 'Hurricane remnants', 'Ice storms', 'Urban flooding'],
    uniqueFacts: [
      'The urban heat island effect keeps NYC several degrees warmer than surrounding suburbs, especially at night.',
      'Central Park holds the city\'s official weather records dating back to 1869.',
      'Coastal proximity moderates extremes — NYC rarely sees temperatures below 0°F or above 100°F.',
    ],
    faqs: [
      { question: 'What is the best month to visit New York City for weather?', answer: 'October is typically the best month — average highs in the mid-60s°F, low humidity, minimal rain, and peak fall foliage. May is a close second for similar conditions before summer humidity arrives.' },
      { question: 'Does it snow a lot in New York City?', answer: 'NYC averages about 28 inches of snow per year, mostly between December and March. Individual nor\'easters can drop 8-24 inches at a time, and the biggest blizzards have buried the city in 30+ inches.' },
      { question: 'How humid does New York get in summer?', answer: 'July and August routinely see dewpoints above 70°F, which feels oppressive. Heat index values can push above 100°F during heat waves even when the air temperature is in the low 90s.' },
      { question: 'When is hurricane season in New York?', answer: 'The Atlantic hurricane season runs June 1 through November 30, but NYC impacts are most likely in August and September. Direct hits are rare, but remnants of tropical systems regularly bring heavy rain and flooding.' },
    ],
  },
  'los-angeles-ca': {
    climateType: 'Mediterranean (Köppen Csb)',
    seasons: {
      spring: 'Spring is mild and pleasant with highs in the 60s-70s°F. May gray brings a stubborn marine layer that often hangs around until afternoon, especially along the coast.',
      summer: 'Summers are warm, dry, and sunny — coastal LA stays in the 70s°F while inland valleys regularly push into the 90s and 100s°F. Rain is essentially nonexistent from June through September.',
      fall: 'Fall brings LA\'s warmest weather, with September and October often hotter than July. Santa Ana winds kick up from the desert, raising fire danger and pushing temperatures into the 90s°F.',
      winter: 'Winters are mild with highs in the 60s-70s°F. Most of LA\'s 15 inches of annual rain falls between December and March, sometimes arriving as intense atmospheric rivers.',
    },
    monthlyHighs: [68, 69, 70, 73, 74, 78, 83, 84, 83, 79, 73, 68],
    monthlyLows: [49, 51, 53, 56, 59, 63, 66, 67, 65, 60, 53, 48],
    bestTimeToVisit: 'March through May and September through November offer the best balance — warm, dry, and without the extreme summer inland heat or winter rains. October is a local favorite.',
    severeRisks: ['Wildfires', 'Santa Ana winds', 'Atmospheric rivers', 'Drought', 'Debris flows'],
    uniqueFacts: [
      'LA enjoys more than 280 sunny days per year — one of the highest in the US.',
      'Microclimates mean a 20°F difference between beach and valley on the same afternoon.',
      'The "June Gloom" marine layer can keep coastal temperatures 15°F below inland readings.',
    ],
    faqs: [
      { question: 'What is the best time of year to visit Los Angeles?', answer: 'April, May, October, and November offer the most comfortable weather — warm days in the 70s°F, cool nights, low humidity, and minimal rain. Summer is hot inland but perfect at the beach.' },
      { question: 'Does it ever rain in Los Angeles?', answer: 'Yes, but almost exclusively between November and April. LA averages about 15 inches of rain per year, most of it delivered by a handful of atmospheric river storms in winter.' },
      { question: 'What are Santa Ana winds?', answer: 'Santa Ana winds are hot, dry, downslope winds that blow from the Mojave Desert toward the coast, typically in fall. They dramatically lower humidity, raise temperatures, and create extreme wildfire risk.' },
      { question: 'Why is Los Angeles so foggy in May and June?', answer: 'The cold Pacific water offshore condenses into a thick marine layer that drifts onshore overnight. "May gray" and "June gloom" can keep coastal LA cloudy until late morning for weeks at a time.' },
    ],
  },
  'chicago-il': {
    climateType: 'Humid continental (Köppen Dfa)',
    seasons: {
      spring: 'Spring in Chicago is famously fickle — snow in April isn\'t unusual, but so are 80°F days. Temperatures swing wildly as Arctic and Gulf air masses collide over the city.',
      summer: 'Summers are hot and humid with highs in the low 80s°F and dewpoints pushing into the 70s. Afternoon and evening thunderstorms are frequent, some of them severe.',
      fall: 'Fall brings crisp air, colorful trees, and some of the year\'s most stable weather. Highs drop from the 70s°F in September to the 40s°F by late November.',
      winter: 'Winters are cold, snowy, and windy. Average highs sit in the low 30s°F, lows often drop into the teens, and Arctic outbreaks can plunge temperatures below 0°F. Lake effect and nor\'easter-style snowstorms combine for 37 inches of annual snowfall.',
    },
    monthlyHighs: [32, 36, 47, 59, 70, 80, 85, 83, 76, 63, 48, 36],
    monthlyLows: [18, 22, 32, 42, 52, 62, 68, 66, 58, 46, 34, 23],
    bestTimeToVisit: 'Late May through early October for warm weather, with September being the sweet spot — warm days, cool nights, and far less humidity than peak summer.',
    severeRisks: ['Blizzards', 'Tornadoes', 'Lake-effect snow', 'Polar vortex outbreaks', 'Severe thunderstorms'],
    uniqueFacts: [
      'Chicago\'s "Windy City" nickname is actually about politicians, not weather — though 10+ mph average winds help.',
      'Lake Michigan moderates temperatures year-round, keeping lakefront neighborhoods cooler in summer and milder in winter.',
      'The record low in Chicago is -27°F, set during the 1985 polar vortex.',
    ],
    faqs: [
      { question: 'When is the best time to visit Chicago weather-wise?', answer: 'September and early October deliver warm days in the 70s°F, cool nights, low humidity, and low rain chances. June is also excellent before summer humidity peaks.' },
      { question: 'How cold does Chicago get in winter?', answer: 'Average winter highs are in the low 30s°F with lows in the teens. Arctic outbreaks can push wind chills below -30°F. The city averages about 37 inches of snow per winter.' },
      { question: 'Does Chicago get tornadoes?', answer: 'Yes — Chicago sits at the northeastern edge of Tornado Alley, and the metro area averages several tornado warnings per year. Most occur between April and June.' },
      { question: 'What is the "lake effect" in Chicago?', answer: 'Cold air passing over warmer Lake Michigan picks up moisture and dumps it as heavy snow on the downwind shore. Chicago sees lake-effect snow less often than cities like Buffalo but it can still produce intense bursts.' },
    ],
  },
  'miami-fl': {
    climateType: 'Tropical monsoon (Köppen Am)',
    seasons: {
      spring: 'Spring is warm, dry, and sunny — arguably Miami\'s most pleasant season. Highs climb from the upper 70s°F in March to the upper 80s°F by May with low humidity.',
      summer: 'Summers are hot, humid, and stormy with daily afternoon thunderstorms rolling off the Everglades. Highs sit in the upper 80s to low 90s°F, and the real temperature feels well into the 100s with humidity.',
      fall: 'Fall is still warm and humid and represents the peak of hurricane season. September and October see the highest tropical threat; weather stays summer-like through November.',
      winter: 'Winters are warm and dry with highs in the mid-70s°F and lows in the 60s°F. Cold fronts occasionally push temperatures into the 40s°F for a night or two.',
    },
    monthlyHighs: [76, 78, 80, 83, 86, 89, 90, 90, 88, 85, 81, 77],
    monthlyLows: [61, 62, 65, 68, 72, 75, 77, 77, 76, 73, 68, 63],
    bestTimeToVisit: 'December through April — warm, dry, low humidity, minimal rain, and outside hurricane season. January and February are peak tourist months for a reason.',
    severeRisks: ['Hurricanes', 'Tropical storms', 'Flash flooding', 'Storm surge', 'Daily lightning'],
    uniqueFacts: [
      'Miami has a true tropical climate — the only major US city besides Honolulu that qualifies.',
      'The city averages 74 thunderstorm days per year, most concentrated in summer afternoons.',
      'Sea breeze collisions between the Atlantic and Gulf fronts create intense, predictable daily storms.',
    ],
    faqs: [
      { question: 'When is the best time to visit Miami?', answer: 'December through April is ideal — warm, dry, sunny, low humidity, and outside hurricane season. Expect highs in the 70s-80s°F and minimal rain.' },
      { question: 'When is hurricane season in Miami?', answer: 'The Atlantic hurricane season runs June 1 through November 30, with the highest risk in August, September, and October. Miami is one of the most hurricane-exposed major US cities.' },
      { question: 'Does Miami get cold in winter?', answer: 'Rarely. Winter highs average in the mid-70s°F and lows in the 60s°F. A strong cold front can briefly push temperatures into the 40s°F, but freezes are extremely rare.' },
      { question: 'Why does it rain every afternoon in Miami?', answer: 'The daily sea breeze pulls moist air inland where it collides with warmer surfaces and triggers afternoon thunderstorms. From June through September, these storms happen nearly every day between 2-6 PM.' },
    ],
  },
  'seattle-wa': {
    climateType: 'Oceanic / marine west coast (Köppen Cfb)',
    seasons: {
      spring: 'Spring is cool and damp with highs slowly climbing from the 50s°F in March to the 60s°F in May. Expect frequent light rain but also longer stretches of sunshine as the season progresses.',
      summer: 'Summers are glorious — warm, dry, and sunny with highs in the upper 70s°F and comfortable low humidity. July and August are the driest months, with almost no rain at all.',
      fall: 'Fall starts pleasant in September and quickly turns wet. By mid-October the Pacific storm track returns, bringing the classic Seattle drizzle and increasingly short days.',
      winter: 'Winters are mild but overcast, with highs in the 40s°F and persistent light rain. Snow is rare in the city itself but common in the nearby Cascades.',
    },
    monthlyHighs: [48, 50, 54, 59, 66, 71, 77, 77, 71, 60, 51, 47],
    monthlyLows: [37, 38, 40, 43, 48, 53, 57, 58, 53, 46, 41, 36],
    bestTimeToVisit: 'July through early September — warm, dry, long days, and some of the best summer weather in the country. Book in advance; locals are outside.',
    severeRisks: ['Atmospheric rivers', 'Wildfire smoke', 'Windstorms', 'Ice storms', 'Landslides'],
    uniqueFacts: [
      'Seattle receives less annual rainfall than New York, Miami, or Atlanta — its reputation comes from drizzle frequency, not volume.',
      'The city enjoys some of the longest summer days in the lower 48, with over 16 hours of daylight in June.',
      'The Olympic Mountains create a rain shadow that keeps Seattle drier than the coast to the west.',
    ],
    faqs: [
      { question: 'Does it really rain all the time in Seattle?', answer: 'Not really. Seattle averages 37 inches of rain per year — less than NYC, Miami, or Atlanta. But it rains often in small amounts, with 150+ cloudy days per year from October through May.' },
      { question: 'When is the best time to visit Seattle?', answer: 'Mid-July through early September. Warm, dry, sunny weather with highs in the upper 70s°F, long daylight hours, and minimal rain. September is a quieter alternative.' },
      { question: 'Does Seattle get snow?', answer: 'Only occasionally. The city averages about 5 inches of snow per year, usually in brief events. When snow does fall, the hilly streets make travel difficult.' },
      { question: 'How cold does Seattle get?', answer: 'Mild by US standards — winter highs average in the upper 40s°F and lows in the upper 30s°F. Hard freezes happen a few times per year but extended deep cold is rare.' },
    ],
  },
}

/**
 * Neighbor map for internal linking — each city points to 3-4 geographically
 * or climatologically adjacent cities. Powers the "Explore nearby cities"
 * section on every city page, which gives Googlebot a dense crawl graph.
 */
export const cityNeighbors: Record<string, string[]> = {
  'new-york-ny': ['philadelphia-pa', 'boston-ma', 'baltimore-md', 'pittsburgh-pa'],
  'los-angeles-ca': ['san-diego-ca', 'las-vegas-nv', 'san-jose-ca', 'phoenix-az'],
  'chicago-il': ['milwaukee-wi', 'indianapolis-in', 'minneapolis-mn', 'detroit-mi'],
  'houston-tx': ['dallas-tx', 'austin-tx', 'san-antonio-tx', 'new-orleans-la'],
  'phoenix-az': ['tucson-az', 'las-vegas-nv', 'albuquerque-nm', 'los-angeles-ca'],
  'philadelphia-pa': ['new-york-ny', 'baltimore-md', 'pittsburgh-pa', 'boston-ma'],
  'san-antonio-tx': ['austin-tx', 'houston-tx', 'dallas-tx', 'fort-worth-tx'],
  'san-diego-ca': ['los-angeles-ca', 'las-vegas-nv', 'phoenix-az', 'san-jose-ca'],
  'dallas-tx': ['fort-worth-tx', 'austin-tx', 'houston-tx', 'san-antonio-tx'],
  'austin-tx': ['san-antonio-tx', 'houston-tx', 'dallas-tx', 'fort-worth-tx'],
  'miami-fl': ['orlando-fl', 'tampa-fl', 'jacksonville-fl', 'new-orleans-la'],
  'atlanta-ga': ['nashville-tn', 'charlotte-nc', 'jacksonville-fl', 'raleigh-nc'],
  'denver-co': ['salt-lake-city-ut', 'albuquerque-nm', 'kansas-city-mo', 'las-vegas-nv'],
  'seattle-wa': ['portland-or', 'san-francisco-ca', 'san-jose-ca', 'anchorage-ak'],
  'san-francisco-ca': ['san-jose-ca', 'sacramento-ca', 'portland-or', 'los-angeles-ca'],
  'boston-ma': ['new-york-ny', 'philadelphia-pa', 'pittsburgh-pa', 'baltimore-md'],
  'las-vegas-nv': ['phoenix-az', 'salt-lake-city-ut', 'los-angeles-ca', 'tucson-az'],
  'portland-or': ['seattle-wa', 'san-francisco-ca', 'sacramento-ca', 'san-jose-ca'],
  'nashville-tn': ['atlanta-ga', 'charlotte-nc', 'st-louis-mo', 'cincinnati-oh'],
  'minneapolis-mn': ['milwaukee-wi', 'chicago-il', 'kansas-city-mo', 'detroit-mi'],
  'orlando-fl': ['tampa-fl', 'miami-fl', 'jacksonville-fl', 'atlanta-ga'],
  'tampa-fl': ['orlando-fl', 'miami-fl', 'jacksonville-fl', 'new-orleans-la'],
  'detroit-mi': ['cleveland-oh', 'chicago-il', 'milwaukee-wi', 'indianapolis-in'],
  'cleveland-oh': ['detroit-mi', 'columbus-oh', 'cincinnati-oh', 'pittsburgh-pa'],
  'indianapolis-in': ['columbus-oh', 'cincinnati-oh', 'chicago-il', 'st-louis-mo'],
  'columbus-oh': ['cincinnati-oh', 'cleveland-oh', 'indianapolis-in', 'pittsburgh-pa'],
  'charlotte-nc': ['raleigh-nc', 'atlanta-ga', 'nashville-tn', 'virginia-beach-va'],
  'baltimore-md': ['philadelphia-pa', 'new-york-ny', 'virginia-beach-va', 'pittsburgh-pa'],
  'milwaukee-wi': ['chicago-il', 'minneapolis-mn', 'detroit-mi', 'indianapolis-in'],
  'kansas-city-mo': ['st-louis-mo', 'minneapolis-mn', 'denver-co', 'indianapolis-in'],
  'salt-lake-city-ut': ['denver-co', 'las-vegas-nv', 'phoenix-az', 'albuquerque-nm'],
  'raleigh-nc': ['charlotte-nc', 'virginia-beach-va', 'atlanta-ga', 'nashville-tn'],
  'new-orleans-la': ['houston-tx', 'jacksonville-fl', 'miami-fl', 'tampa-fl'],
  'virginia-beach-va': ['raleigh-nc', 'baltimore-md', 'charlotte-nc', 'philadelphia-pa'],
  'sacramento-ca': ['san-francisco-ca', 'san-jose-ca', 'portland-or', 'los-angeles-ca'],
  'pittsburgh-pa': ['cleveland-oh', 'philadelphia-pa', 'columbus-oh', 'baltimore-md'],
  'st-louis-mo': ['kansas-city-mo', 'indianapolis-in', 'nashville-tn', 'cincinnati-oh'],
  'cincinnati-oh': ['columbus-oh', 'indianapolis-in', 'cleveland-oh', 'nashville-tn'],
  'honolulu-hi': ['anchorage-ak', 'san-francisco-ca', 'san-jose-ca', 'los-angeles-ca'],
  'anchorage-ak': ['seattle-wa', 'portland-or', 'honolulu-hi', 'san-francisco-ca'],
  'san-jose-ca': ['san-francisco-ca', 'sacramento-ca', 'los-angeles-ca', 'portland-or'],
  'jacksonville-fl': ['orlando-fl', 'tampa-fl', 'miami-fl', 'atlanta-ga'],
  'fort-worth-tx': ['dallas-tx', 'austin-tx', 'houston-tx', 'san-antonio-tx'],
  'albuquerque-nm': ['phoenix-az', 'tucson-az', 'denver-co', 'salt-lake-city-ut'],
  'tucson-az': ['phoenix-az', 'albuquerque-nm', 'las-vegas-nv', 'san-diego-ca'],
}

/** Return rich SEO enrichment for a city, or null if not yet curated. */
export function getCityEnrichment(slug: string): CitySeoEnrichment | null {
  return cityEnrichments[slug] ?? null
}

/**
 * Resolve neighbor slugs into full name/state records for link rendering.
 * Filters out any neighbor that isn't in cityData (should never happen but
 * protects against typos in the neighbor map).
 */
export function getNearbyCities(slug: string): Array<{ slug: string; name: string; state: string }> {
  const neighbors = cityNeighbors[slug] ?? []
  return neighbors
    .map(neighborSlug => {
      const data = cityData[neighborSlug]
      if (!data) return null
      return { slug: neighborSlug, name: data.name, state: data.state }
    })
    .filter((x): x is { slug: string; name: string; state: string } => x !== null)
}

