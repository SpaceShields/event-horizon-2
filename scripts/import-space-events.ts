import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const OWNER_ID = 'ddb9fe22-0b00-4a70-9388-4a2959dc6c65' // spacedaoist@gmail.com

// Category mapping
const CATEGORIES = {
  CONFERENCE: 1,
  WORKSHOP: 2,
  NETWORKING: 3,
  ENTERTAINMENT: 4,
  COMMUNITY: 5,
  CHARITY: 6,
  SPORTS: 7,
  OTHER: 8,
}

interface EventData {
  title: string
  date: string
  location?: string
  format?: string
  category: string
  registration?: string
  description?: string
}

const events: EventData[] = [
  // January 2026
  {
    title: "Astrobee Free Flying Robotic ISAM Testbed: Opportunities to Accelerate V&V in Space",
    date: "2026-01-07",
    format: "Virtual event",
    category: "Workshop",
    registration: "zoom.us/webinar/register/WN_YPTqujUlQx-6q-ROo7eBbg",
    description: "Technical webinar on Astrobee free flying robotic testing in space",
  },
  {
    title: "PTC'26",
    date: "2026-01-18",
    location: "Hilton Hawaiian Village Waikiki Beach Resort, Honolulu, Hawaii, USA",
    category: "Conference",
    description: "Conference running from January 18-21, 2026",
  },
  {
    title: "Middle East Space Conference",
    date: "2026-01-26",
    location: "Oman Convention and Exhibition Centre, Muscat, Oman",
    category: "Conference",
    description: "Regional space conference for the Middle East, January 26-28, 2026",
  },
  {
    title: "Space Debris Conference 2026",
    date: "2026-01-26",
    location: "Riyadh, Saudi Arabia",
    category: "Conference",
    description: "Specialized conference on space debris, January 26-27, 2026",
  },
  {
    title: "European Space Conference",
    date: "2026-01-27",
    location: "SQUARE, Brussels, Belgium",
    category: "Conference",
    description: "European space conference, January 27-28, 2026",
  },
  {
    title: "Commercial Space Week",
    date: "2026-01-27",
    location: "Orange County Conference Center, Orlando, Florida, USA",
    category: "Conference",
    description: "Industry week focused on commercial space, January 27-30, 2026",
  },
  {
    title: "GSA Spaceport Summit",
    date: "2026-01-27",
    location: "Orange County Conference Center, Orlando, Florida, USA",
    category: "Conference",
    description: "Spaceport-focused summit, January 27, 2026",
  },
  {
    title: "SpaceCom",
    date: "2026-01-28",
    location: "Orange County Conference Center, Orlando, Florida, USA",
    category: "Conference",
    description: "Trade show and expo for the space industry, January 28-30, 2026",
  },
  {
    title: "Space Mobility Conference",
    date: "2026-01-28",
    location: "Orange County Conference Center, Orlando, Florida, USA",
    category: "Conference",
    description: "Specialized conference on space mobility, January 28-30, 2026",
  },
  // February 2026
  {
    title: "Space Summit 2026 (Singapore Airshow)",
    date: "2026-02-02",
    location: "Sands Expo & Convention Centre, Marina Bay Sands, Singapore",
    category: "Conference",
    description: "Space summit held alongside Singapore Airshow, February 2-3, 2026",
  },
  {
    title: "Space Suppliers Summit",
    date: "2026-02-03",
    location: "Technology and Innovation Centre, Glasgow, Scotland",
    category: "Conference",
    description: "Industry summit for space suppliers, February 3-4, 2026",
  },
  {
    title: "EARSeL Workshop on Land Ice and Snow",
    date: "2026-02-09",
    location: "Finnish Meteorological Institute (FMI), Kumpula, Helsinki, Finland",
    category: "Workshop",
    description: "Scientific workshop on land ice and snow, February 9-11, 2026",
  },
  {
    title: "SmallSat Symposium",
    date: "2026-02-10",
    location: "Silicon Valley, Mountain View, California, USA",
    category: "Conference",
    description: "Specialized symposium on small satellites, February 10-12, 2026",
  },
  {
    title: "GEO Week",
    date: "2026-02-16",
    location: "Colorado Convention Center, Denver, Colorado, USA",
    category: "Conference",
    description: "Industry week focused on geospatial and Earth observation, February 16-18, 2026",
  },
  {
    title: "International Conference on Space Optical Systems and Applications (ICSOS)",
    date: "2026-02-17",
    location: "Manila, Philippines",
    format: "Hybrid",
    category: "Conference",
    description: "Technical conference on space optical systems, February 17-18, 2026",
  },
  {
    title: "Spanish Small Satellites International Forum (SSIF)",
    date: "2026-02-17",
    location: "Malaga, Spain",
    category: "Conference",
    description: "International forum on small satellites, February 17-19, 2026",
  },
  {
    title: "Innovate Space: Finance Forum",
    date: "2026-02-18",
    location: "Dallas, Texas, USA",
    category: "Conference",
    description: "Finance-focused forum for the space industry, February 18-19, 2026",
  },
  {
    title: "ASCENDxTexas",
    date: "2026-02-23",
    location: "South Shore Harbour Resort and Conference Center, Houston, Texas, USA",
    category: "Conference",
    description: "Regional space conference, February 23-26, 2026",
  },
  {
    title: "National Space Science Symposium",
    date: "2026-02-23",
    location: "NESAC, Shillong, India",
    category: "Conference",
    description: "Scientific symposium on space science, February 23-27, 2026",
  },
  {
    title: "Beyond Earth Symposium",
    date: "2026-02-24",
    location: "American University Washington College of Law, Washington DC, USA",
    category: "Conference",
    description: "Specialized symposium on space law and policy, February 24-25, 2026",
  },
  {
    title: "Space Beach Law Lab 2026",
    date: "2026-02-24",
    location: "Long Beach, California, USA",
    category: "Workshop",
    description: "Legal and professional workshop for space law, February 24-26, 2026",
  },
  {
    title: "GovSatCom",
    date: "2026-02-26",
    location: "European Convention Center, Luxembourg",
    category: "Conference",
    description: "Government satellite communications conference, February 26, 2026",
  },
  // March 2026
  {
    title: "Joint Space Operations Summit",
    date: "2026-03-04",
    location: "National Harbor, Maryland, USA",
    category: "Conference",
    description: "Operations-focused summit, March 4-5, 2026",
  },
  {
    title: "Space-Comm Europe",
    date: "2026-03-04",
    location: "London ExCeL, London, UK",
    category: "Conference",
    description: "European space communications conference, March 4-5, 2026",
  },
  {
    title: "IEEE Aerospace Conference",
    date: "2026-03-07",
    location: "Yellowstone Conference Center, Big Sky, Montana, USA",
    category: "Conference",
    description: "Major technical aerospace conference, March 7-14, 2026",
  },
  {
    title: "Paris Space Week",
    date: "2026-03-10",
    location: "Espace Champerret, Paris, France",
    category: "Conference",
    description: "Industry week focused on space, March 10-11, 2026",
  },
  {
    title: "Convergence India",
    date: "2026-03-23",
    location: "Bharat Mandapam, New Delhi, India",
    category: "Conference",
    description: "International conference on communications and technology, March 23-25, 2026",
  },
  {
    title: "Munich Space Summit",
    date: "2026-03-23",
    location: "Munich, Germany",
    category: "Conference",
    description: "Space industry summit, March 23-27, 2026",
  },
  {
    title: "Satellite 2026",
    date: "2026-03-23",
    location: "Walter E Washington Convention Center, Washington DC, USA",
    category: "Conference",
    description: "Major satellite industry trade show, March 23-26, 2026",
  },
  {
    title: "IAF Spring Meetings 2026",
    date: "2026-03-24",
    location: "Paris, France",
    category: "Conference",
    description: "International Astronautical Federation spring meetings, March 24-26, 2026",
  },
  {
    title: "PocketQube Conference",
    date: "2026-03-25",
    location: "Glasgow University Union, Glasgow, Scotland, UK",
    category: "Conference",
    description: "Specialized conference on PocketQube satellites, March 25-27, 2026",
  },
  // April 2026
  {
    title: "Space Symposium",
    date: "2026-04-13",
    location: "The Broadmoor, Colorado Springs, Colorado, USA",
    category: "Conference",
    description: "Premier space industry symposium, April 13-16, 2026",
  },
  {
    title: "NAB Show Las Vegas",
    date: "2026-04-18",
    location: "Las Vegas, Nevada, USA",
    category: "Conference",
    description: "Broadcast and media technology conference, April 18-22, 2026",
  },
  {
    title: "SpaceOps 2026 Workshop",
    date: "2026-04-21",
    location: "MBRSC, Dubai, UAE",
    category: "Workshop",
    description: "Space operations workshop, April 21-23, 2026",
  },
  {
    title: "Military Space Situational Awareness",
    date: "2026-04-27",
    location: "London, UK",
    category: "Conference",
    description: "Defense-focused conference on space situational awareness, April 27-29, 2026",
  },
  // May 2026
  {
    title: "Aerospace Mechanisms Symposium",
    date: "2026-05-01",
    location: "Huntsville, Alabama, USA",
    category: "Conference",
    description: "Technical symposium on aerospace mechanisms, May 1, 2026",
  },
  {
    title: "GEOINT Symposium",
    date: "2026-05-03",
    location: "Gaylord Rockies Resort and Convention Center, Aurora, Colorado, USA",
    category: "Conference",
    description: "Geospatial intelligence symposium, May 3-6, 2026",
  },
  {
    title: "Luxembourg Space Resources Week",
    date: "2026-05-04",
    location: "Luxexpo, The Box, Luxembourg",
    category: "Conference",
    description: "Industry week on space resources, May 4-7, 2026",
  },
  {
    title: "Small Satellites Systems and Services Symposium (4S Symposium)",
    date: "2026-05-04",
    location: "Forte Village, Sardinia, Italy",
    category: "Conference",
    description: "Small satellite systems symposium, May 4-8, 2026",
  },
  {
    title: "IAASS Conference – Together for a Safe Space Frontier",
    date: "2026-05-05",
    location: "Albuquerque, New Mexico, USA",
    category: "Conference",
    description: "Space safety and security conference, May 5-7, 2026",
  },
  {
    title: "C4ISR Global",
    date: "2026-05-06",
    location: "Hilton London Syon Park, London, UK",
    category: "Conference",
    description: "Defense technology conference, May 6-7, 2026",
  },
  {
    title: "International Conference on Space Optical Systems and Applications (ICSOS) - Amsterdam",
    date: "2026-05-11",
    location: "Amsterdam, The Netherlands",
    format: "Hybrid",
    category: "Conference",
    description: "Technical conference on space optical systems, May 11-12, 2026",
  },
  {
    title: "Space Meeting Veneto",
    date: "2026-05-11",
    location: "Venice, Italy",
    category: "Conference",
    description: "Regional space industry meeting, May 11-13, 2026",
  },
  {
    title: "Space Summit for a Resilient Future",
    date: "2026-05-12",
    location: "Centre de Congrès Pierre Baudis, Toulouse, France",
    category: "Conference",
    description: "Thematic summit on space resilience, May 12-13, 2026",
  },
  {
    title: "Global Space Technology Convention & Exhibition",
    date: "2026-05-13",
    location: "Sands Expo and Convention Centre, Marina Bay Sands, Singapore",
    category: "Conference",
    description: "Global space technology convention and exhibition, May 13-14, 2026",
  },
  {
    title: "ASCEND 2026",
    date: "2026-05-19",
    location: "Washington DC, USA",
    category: "Conference",
    description: "Major aerospace and space industry conference, May 19-21, 2026",
  },
  {
    title: "CABSAT",
    date: "2026-05-20",
    location: "Dubai World Trade Centre, Dubai",
    category: "Conference",
    description: "Broadcast and satellite conference, May 20-22, 2026",
  },
  {
    title: "CommunicAsia",
    date: "2026-05-20",
    location: "Singapore EXPO, Singapore",
    category: "Conference",
    description: "Communications technology conference, May 20-22, 2026",
  },
  {
    title: "SmallSat Europe",
    date: "2026-05-26",
    location: "RAI Convention Centre, Amsterdam, The Netherlands",
    category: "Conference",
    description: "European small satellite conference, May 26-28, 2026",
  },
  // June 2026
  {
    title: "EARSeL Workshop on Imaging Spectroscopy",
    date: "2026-06-02",
    location: "Aalto University, Helsinki, Finland",
    category: "Workshop",
    description: "Scientific workshop on imaging spectroscopy, June 2-4, 2026",
  },
  {
    title: "Global Space Conference on Climate Change (GLOC 2026)",
    date: "2026-06-02",
    category: "Conference",
    description: "Climate-focused space conference, June 2-4, 2026",
  },
  {
    title: "International Space Summit Africa",
    date: "2026-06-02",
    location: "Pretoria, South Africa",
    category: "Conference",
    description: "Regional summit for African space industry, June 2-4, 2026",
  },
  {
    title: "Space Tech Expo USA",
    date: "2026-06-02",
    location: "Anaheim Convention Center, Anaheim, California, USA",
    category: "Conference",
    description: "Space technology trade exposition, June 2-4, 2026",
  },
  {
    title: "International Space Development Conference (ISDC)",
    date: "2026-06-04",
    location: "Hilton McLean Tysons Corner, McLean, Virginia, USA",
    category: "Conference",
    description: "Development-focused space conference, June 4-7, 2026",
  },
  {
    title: "International Conference on Space Optical Systems and Applications (ICSOS) - Copenhagen",
    date: "2026-06-08",
    location: "Copenhagen, Denmark",
    format: "Hybrid",
    category: "Conference",
    description: "Technical conference on space optical systems, June 8-9, 2026",
  },
  {
    title: "Space & Satellites USA 2026",
    date: "2026-06-08",
    location: "Washington Marriott at Metro Center, Washington, DC, USA",
    category: "Conference",
    registration: "events.reutersevents.com",
    description: "Major satellite trade conference, June 8-9, 2026",
  },
  {
    title: "Global Satellite Servicing Forum and International Day",
    date: "2026-06-09",
    location: "Chantilly, Virginia, USA",
    category: "Conference",
    description: "Specialized forum on satellite servicing, June 9-11, 2026",
  },
  {
    title: "ILA Berlin",
    date: "2026-06-10",
    location: "BER Airport, Berlin, Germany",
    category: "Conference",
    description: "Major international air and space show, June 10-14, 2026",
  },
  {
    title: "MilSatCom USA",
    date: "2026-06-10",
    location: "Arlington, Virginia, USA",
    category: "Conference",
    description: "Military satellite communications conference, June 10-11, 2026",
  },
  {
    title: "MAST Focus Forum USA",
    date: "2026-06-24",
    location: "Waikiki, Hawaii, USA",
    category: "Conference",
    description: "Specialized forum, June 24-25, 2026",
  },
  // July 2026
  {
    title: "Farnborough International Air Show",
    date: "2026-07-20",
    location: "Farnborough, UK",
    category: "Conference",
    description: "Major international air and space show, July 20-24, 2026",
  },
  // August 2026
  {
    title: "COSPAR Scientific Assembly",
    date: "2026-08-01",
    location: "Florence, Italy",
    category: "Conference",
    description: "Major scientific assembly on space research, August 1-9, 2026",
  },
  {
    title: "3rd International Conference on AI Sensors and Transducers (AIS 2026)",
    date: "2026-08-02",
    location: "Jeju, Korea",
    category: "Conference",
    description: "AI and sensor technology conference, August 2-7, 2026",
  },
  // September 2026
  {
    title: "IBC",
    date: "2026-09-11",
    location: "RAI, Amsterdam, The Netherlands",
    category: "Conference",
    description: "International broadcast technology conference, September 11-14, 2026",
  },
  {
    title: "World Space Business Week",
    date: "2026-09-14",
    location: "Paris, France",
    category: "Conference",
    description: "Major space business industry week, September 14-18, 2026",
  },
  {
    title: "Space Defense and Security Summit",
    date: "2026-09-15",
    location: "Paris, France",
    category: "Conference",
    description: "Defense and security summit, September 15-16, 2026",
  },
  {
    title: "Industry Space Days",
    date: "2026-09-16",
    location: "ESTEC, Noordwijk, The Netherlands",
    category: "Conference",
    description: "Industry days at ESTEC, September 16-17, 2026",
  },
  {
    title: "Space Innovation Summit",
    date: "2026-09-17",
    location: "Hôtel du Collectionneur, Paris, France",
    category: "Conference",
    description: "Innovation-focused summit, September 17, 2026",
  },
  {
    title: "Texas Space Summit",
    date: "2026-09-21",
    location: "Henry B. González Convention Center, San Antonio, Texas, USA",
    category: "Conference",
    description: "Regional space summit for Texas, September 21-23, 2026",
  },
  {
    title: "RADECS - Radiation and Its Effects on Components and Systems",
    date: "2026-09-28",
    location: "Prague, Czech Republic",
    category: "Conference",
    description: "Technical conference on radiation effects, September 28-October 2, 2026",
  },
  {
    title: "EARSeL Symposium",
    date: "2026-09-29",
    location: "Department of Geography, Harokopio University of Athens, Athens, Greece",
    category: "Conference",
    description: "Scientific symposium on remote sensing, September 29-October 2, 2026",
  },
  {
    title: "Strategies in Satellite Ground Segment Conference",
    date: "2026-09-30",
    location: "Park Plaza Victoria, London, UK",
    category: "Conference",
    description: "Specialized conference on satellite ground segments, September 30-October 1, 2026",
  },
  // October 2026
  {
    title: "International Astronautical Congress",
    date: "2026-10-05",
    location: "Antalya, Türkiye",
    category: "Conference",
    description: "Premier international space industry congress, October 5-9, 2026",
  },
  {
    title: "Space Passive Components Days (SPCD)",
    date: "2026-10-13",
    location: "ESA/ESTEC, Noordwijk, The Netherlands",
    category: "Conference",
    description: "Technical symposium on space components, October 13-16, 2026",
  },
  {
    title: "5th Geospatial and Space Technology Forum",
    date: "2026-10-27",
    location: "Riyadh, Saudi Arabia",
    category: "Conference",
    description: "Geospatial technology forum, October 27-28, 2026",
  },
  // November 2026
  {
    title: "Global MilSatCom",
    date: "2026-11-02",
    location: "London, UK",
    category: "Conference",
    description: "Global military satellite communications conference, November 2-5, 2026",
  },
  {
    title: "Space Simulation Conference",
    date: "2026-11-16",
    location: "Annapolis, Maryland, USA",
    category: "Conference",
    description: "Technical conference on space simulation, November 16-19, 2026",
  },
  {
    title: "Space Tech Expo Europe",
    date: "2026-11-17",
    location: "Bremen, Germany",
    category: "Conference",
    description: "European space technology trade exposition, November 17-19, 2026",
  },
]

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

function getCategoryId(category: string): number {
  const categoryMap: Record<string, number> = {
    'Conference': CATEGORIES.CONFERENCE,
    'Workshop': CATEGORIES.WORKSHOP,
    'Networking': CATEGORIES.NETWORKING,
    'Entertainment': CATEGORIES.ENTERTAINMENT,
    'Community': CATEGORIES.COMMUNITY,
    'Charity': CATEGORIES.CHARITY,
    'Sports': CATEGORIES.SPORTS,
    'Other': CATEGORIES.OTHER,
  }
  return categoryMap[category] || CATEGORIES.OTHER
}

function getLocationType(event: EventData): 'physical' | 'virtual' | 'hybrid' {
  if (event.format?.toLowerCase().includes('virtual')) return 'virtual'
  if (event.format?.toLowerCase().includes('hybrid')) return 'hybrid'
  if (event.location) return 'physical'
  return 'physical'
}

async function importEvents() {
  console.log('Starting import of space events...')
  let successCount = 0
  let errorCount = 0

  for (const event of events) {
    try {
      const slug = createSlug(event.title)
      const categoryId = getCategoryId(event.category)
      const locationType = getLocationType(event)

      // Create start datetime (assuming events start at 9 AM local time)
      const startDatetime = new Date(event.date + 'T09:00:00Z')

      // Default end time to 5 PM same day (8 hour event)
      const endDatetime = new Date(event.date + 'T17:00:00Z')

      const eventData = {
        title: event.title,
        slug,
        description: event.description || `${event.title}. ${event.location || ''}`,
        organization_name: null,
        owner_id: OWNER_ID,
        category_id: categoryId,
        location_type: locationType,
        address: locationType === 'physical' || locationType === 'hybrid' ? event.location : null,
        meeting_url: event.registration || null,
        start_datetime: startDatetime.toISOString(),
        end_datetime: endDatetime.toISOString(),
        timezone: 'UTC',
        capacity: null,
        ticket_price: null,
        registration_instructions: event.registration ? `Register at: ${event.registration}` : null,
        status: 'published',
        image_url: null,
      }

      const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()

      if (error) {
        console.error(`Error inserting "${event.title}":`, error.message)
        errorCount++
      } else {
        console.log(`✓ Imported: ${event.title}`)
        successCount++
      }
    } catch (err) {
      console.error(`Error processing "${event.title}":`, err)
      errorCount++
    }
  }

  console.log('\n=== Import Summary ===')
  console.log(`Successfully imported: ${successCount} events`)
  console.log(`Failed: ${errorCount} events`)
  console.log(`Total: ${events.length} events`)
}

importEvents().catch(console.error)
