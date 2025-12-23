const events = [
  // January - February 2026
  { title: "PTC'26", slug: "ptc26", desc: "Conference running from January 18-21, 2026", location: "Hilton Hawaiian Village Waikiki Beach Resort, Honolulu, Hawaii, USA", start: "2026-01-18", end: "2026-01-21", cat: 1, type: "physical" },
  { title: "Middle East Space Conference", slug: "middle-east-space-conference", desc: "Regional space conference for the Middle East, January 26-28, 2026", location: "Oman Convention and Exhibition Centre, Muscat, Oman", start: "2026-01-26", end: "2026-01-28", cat: 1, type: "physical" },
  { title: "Space Debris Conference 2026", slug: "space-debris-conference-2026", desc: "Specialized conference on space debris, January 26-27, 2026", location: "Riyadh, Saudi Arabia", start: "2026-01-26", end: "2026-01-27", cat: 1, type: "physical" },
  { title: "European Space Conference", slug: "european-space-conference", desc: "European space conference, January 27-28, 2026", location: "SQUARE, Brussels, Belgium", start: "2026-01-27", end: "2026-01-28", cat: 1, type: "physical" },
  { title: "Commercial Space Week", slug: "commercial-space-week", desc: "Industry week focused on commercial space, January 27-30, 2026", location: "Orange County Conference Center, Orlando, Florida, USA", start: "2026-01-27", end: "2026-01-30", cat: 1, type: "physical" },
  { title: "GSA Spaceport Summit", slug: "gsa-spaceport-summit", desc: "Spaceport-focused summit, January 27, 2026", location: "Orange County Conference Center, Orlando, Florida, USA", start: "2026-01-27", end: "2026-01-27", cat: 1, type: "physical" },
  { title: "SpaceCom", slug: "spacecom", desc: "Trade show and expo for the space industry, January 28-30, 2026", location: "Orange County Conference Center, Orlando, Florida, USA", start: "2026-01-28", end: "2026-01-30", cat: 1, type: "physical" },
  { title: "Space Mobility Conference", slug: "space-mobility-conference", desc: "Specialized conference on space mobility, January 28-30, 2026", location: "Orange County Conference Center, Orlando, Florida, USA", start: "2026-01-28", end: "2026-01-30", cat: 1, type: "physical" },
  { title: "Space Summit 2026 (Singapore Airshow)", slug: "space-summit-2026-singapore-airshow", desc: "Space summit held alongside Singapore Airshow, February 2-3, 2026", location: "Sands Expo & Convention Centre, Marina Bay Sands, Singapore", start: "2026-02-02", end: "2026-02-03", cat: 1, type: "physical" },
  { title: "Space Suppliers Summit", slug: "space-suppliers-summit", desc: "Industry summit for space suppliers, February 3-4, 2026", location: "Technology and Innovation Centre, Glasgow, Scotland", start: "2026-02-03", end: "2026-02-04", cat: 1, type: "physical" },
  { title: "EARSeL Workshop on Land Ice and Snow", slug: "earsel-workshop-on-land-ice-and-snow", desc: "Scientific workshop on land ice and snow, February 9-11, 2026", location: "Finnish Meteorological Institute (FMI), Kumpula, Helsinki, Finland", start: "2026-02-09", end: "2026-02-11", cat: 2, type: "physical" },
  { title: "SmallSat Symposium", slug: "smallsat-symposium", desc: "Specialized symposium on small satellites, February 10-12, 2026", location: "Silicon Valley, Mountain View, California, USA", start: "2026-02-10", end: "2026-02-12", cat: 1, type: "physical" },
  { title: "GEO Week", slug: "geo-week", desc: "Industry week focused on geospatial and Earth observation, February 16-18, 2026", location: "Colorado Convention Center, Denver, Colorado, USA", start: "2026-02-16", end: "2026-02-18", cat: 1, type: "physical" },
  { title: "International Conference on Space Optical Systems and Applications (ICSOS)", slug: "icsos-manila-feb-2026", desc: "Technical conference on space optical systems, February 17-18, 2026", location: "Manila, Philippines", meetingUrl: "https://icsos.org/virtual", start: "2026-02-17", end: "2026-02-18", cat: 1, type: "hybrid" },
  { title: "Spanish Small Satellites International Forum (SSIF)", slug: "ssif-2026", desc: "International forum on small satellites, February 17-19, 2026", location: "Malaga, Spain", start: "2026-02-17", end: "2026-02-19", cat: 1, type: "physical" },
  { title: "Innovate Space: Finance Forum", slug: "innovate-space-finance-forum-2026", desc: "Finance-focused forum for the space industry, February 18-19, 2026", location: "Dallas, Texas, USA", start: "2026-02-18", end: "2026-02-19", cat: 1, type: "physical" },
  { title: "ASCENDxTexas", slug: "ascendxtexas-2026", desc: "Regional space conference, February 23-26, 2026", location: "South Shore Harbour Resort and Conference Center, Houston, Texas, USA", start: "2026-02-23", end: "2026-02-26", cat: 1, type: "physical" },
  { title: "National Space Science Symposium", slug: "national-space-science-symposium-2026", desc: "Scientific symposium on space science, February 23-27, 2026", location: "NESAC, Shillong, India", start: "2026-02-23", end: "2026-02-27", cat: 1, type: "physical" },
  { title: "Beyond Earth Symposium", slug: "beyond-earth-symposium-2026", desc: "Specialized symposium on space law and policy, February 24-25, 2026", location: "American University Washington College of Law, Washington DC, USA", start: "2026-02-24", end: "2026-02-25", cat: 1, type: "physical" },
  { title: "Space Beach Law Lab 2026", slug: "space-beach-law-lab-2026", desc: "Legal and professional workshop for space law, February 24-26, 2026", location: "Long Beach, California, USA", start: "2026-02-24", end: "2026-02-26", cat: 2, type: "physical" },

  // March 2026
  { title: "GovSatCom", slug: "govsatcom-2026", desc: "Government satellite communications conference, February 26, 2026", location: "European Convention Center, Luxembourg", start: "2026-02-26", end: "2026-02-26", cat: 1, type: "physical" },
  { title: "Joint Space Operations Summit", slug: "joint-space-operations-summit-2026", desc: "Operations-focused summit, March 4-5, 2026", location: "National Harbor, Maryland, USA", start: "2026-03-04", end: "2026-03-05", cat: 1, type: "physical" },
  { title: "Space-Comm Europe", slug: "space-comm-europe-2026", desc: "European space communications conference, March 4-5, 2026", location: "London ExCeL, London, UK", start: "2026-03-04", end: "2026-03-05", cat: 1, type: "physical" },
  { title: "IEEE Aerospace Conference", slug: "ieee-aerospace-conference-2026", desc: "Major technical aerospace conference, March 7-14, 2026", location: "Yellowstone Conference Center, Big Sky, Montana, USA", start: "2026-03-07", end: "2026-03-14", cat: 1, type: "physical" },
  { title: "Paris Space Week", slug: "paris-space-week-2026", desc: "Industry week focused on space, March 10-11, 2026", location: "Espace Champerret, Paris, France", start: "2026-03-10", end: "2026-03-11", cat: 1, type: "physical" },
  { title: "Convergence India", slug: "convergence-india-2026", desc: "International conference on communications and technology, March 23-25, 2026", location: "Bharat Mandapam, New Delhi, India", start: "2026-03-23", end: "2026-03-25", cat: 1, type: "physical" },
  { title: "Munich Space Summit", slug: "munich-space-summit-2026", desc: "Space industry summit, March 23-27, 2026", location: "Munich, Germany", start: "2026-03-23", end: "2026-03-27", cat: 1, type: "physical" },
  { title: "Satellite 2026", slug: "satellite-2026", desc: "Major satellite industry trade show, March 23-26, 2026", location: "Walter E Washington Convention Center, Washington DC, USA", start: "2026-03-23", end: "2026-03-26", cat: 1, type: "physical" },
  { title: "IAF Spring Meetings 2026", slug: "iaf-spring-meetings-2026", desc: "International Astronautical Federation spring meetings, March 24-26, 2026", location: "Paris, France", start: "2026-03-24", end: "2026-03-26", cat: 1, type: "physical" },
  { title: "PocketQube Conference", slug: "pocketqube-conference-2026", desc: "Specialized conference on PocketQube satellites, March 25-27, 2026", location: "Glasgow University Union, Glasgow, Scotland, UK", start: "2026-03-25", end: "2026-03-27", cat: 1, type: "physical" },

  // April-May 2026
  { title: "Space Symposium", slug: "space-symposium-2026", desc: "Premier space industry symposium, April 13-16, 2026", location: "The Broadmoor, Colorado Springs, Colorado, USA", start: "2026-04-13", end: "2026-04-16", cat: 1, type: "physical" },
  { title: "NAB Show Las Vegas", slug: "nab-show-2026", desc: "Broadcast and media technology conference, April 18-22, 2026", location: "Las Vegas, Nevada, USA", start: "2026-04-18", end: "2026-04-22", cat: 1, type: "physical" },
  { title: "SpaceOps 2026 Workshop", slug: "spaceops-2026-workshop", desc: "Space operations workshop, April 21-23, 2026", location: "MBRSC, Dubai, UAE", start: "2026-04-21", end: "2026-04-23", cat: 2, type: "physical" },
  { title: "Military Space Situational Awareness", slug: "military-space-situational-awareness-2026", desc: "Defense-focused conference on space situational awareness, April 27-29, 2026", location: "London, UK", start: "2026-04-27", end: "2026-04-29", cat: 1, type: "physical" },
  { title: "Aerospace Mechanisms Symposium", slug: "aerospace-mechanisms-symposium-2026", desc: "Technical symposium on aerospace mechanisms, May 1, 2026", location: "Huntsville, Alabama, USA", start: "2026-05-01", end: "2026-05-01", cat: 1, type: "physical" },
  { title: "GEOINT Symposium", slug: "geoint-symposium-2026", desc: "Geospatial intelligence symposium, May 3-6, 2026", location: "Gaylord Rockies Resort and Convention Center, Aurora, Colorado, USA", start: "2026-05-03", end: "2026-05-06", cat: 1, type: "physical" },
  { title: "Luxembourg Space Resources Week", slug: "luxembourg-space-resources-week-2026", desc: "Industry week on space resources, May 4-7, 2026", location: "Luxexpo, The Box, Luxembourg", start: "2026-05-04", end: "2026-05-07", cat: 1, type: "physical" },
  { title: "Small Satellites Systems and Services Symposium (4S Symposium)", slug: "4s-symposium-2026", desc: "Small satellite systems symposium, May 4-8, 2026", location: "Forte Village, Sardinia, Italy", start: "2026-05-04", end: "2026-05-08", cat: 1, type: "physical" },
  { title: "IAASS Conference - Together for a Safe Space Frontier", slug: "iaass-conference-2026", desc: "Space safety and security conference, May 5-7, 2026", location: "Albuquerque, New Mexico, USA", start: "2026-05-05", end: "2026-05-07", cat: 1, type: "physical" },
  { title: "C4ISR Global", slug: "c4isr-global-2026", desc: "Defense technology conference, May 6-7, 2026", location: "Hilton London Syon Park, London, UK", start: "2026-05-06", end: "2026-05-07", cat: 1, type: "physical" },

  // May-June 2026
  { title: "ICSOS Amsterdam", slug: "icsos-amsterdam-may-2026", desc: "Technical conference on space optical systems, May 11-12, 2026", location: "Amsterdam, The Netherlands", meetingUrl: "https://icsos.org/virtual", start: "2026-05-11", end: "2026-05-12", cat: 1, type: "hybrid" },
  { title: "Space Meeting Veneto", slug: "space-meeting-veneto-2026", desc: "Regional space industry meeting, May 11-13, 2026", location: "Venice, Italy", start: "2026-05-11", end: "2026-05-13", cat: 1, type: "physical" },
  { title: "Space Summit for a Resilient Future", slug: "space-summit-resilient-future-2026", desc: "Thematic summit on space resilience, May 12-13, 2026", location: "Centre de Congrès Pierre Baudis, Toulouse, France", start: "2026-05-12", end: "2026-05-13", cat: 1, type: "physical" },
  { title: "Global Space Technology Convention & Exhibition", slug: "global-space-tech-convention-2026", desc: "Global space technology convention and exhibition, May 13-14, 2026", location: "Sands Expo and Convention Centre, Marina Bay Sands, Singapore", start: "2026-05-13", end: "2026-05-14", cat: 1, type: "physical" },
  { title: "ASCEND 2026", slug: "ascend-2026", desc: "Major aerospace and space industry conference, May 19-21, 2026", location: "Washington DC, USA", start: "2026-05-19", end: "2026-05-21", cat: 1, type: "physical" },
  { title: "CABSAT", slug: "cabsat-2026", desc: "Broadcast and satellite conference, May 20-22, 2026", location: "Dubai World Trade Centre, Dubai", start: "2026-05-20", end: "2026-05-22", cat: 1, type: "physical" },
  { title: "CommunicAsia", slug: "communicasia-2026", desc: "Communications technology conference, May 20-22, 2026", location: "Singapore EXPO, Singapore", start: "2026-05-20", end: "2026-05-22", cat: 1, type: "physical" },
  { title: "SmallSat Europe", slug: "smallsat-europe-2026", desc: "European small satellite conference, May 26-28, 2026", location: "RAI Convention Centre, Amsterdam, The Netherlands", start: "2026-05-26", end: "2026-05-28", cat: 1, type: "physical" },
  { title: "EARSeL Workshop on Imaging Spectroscopy", slug: "earsel-imaging-spectroscopy-2026", desc: "Scientific workshop on imaging spectroscopy, June 2-4, 2026", location: "Aalto University, Helsinki, Finland", start: "2026-06-02", end: "2026-06-04", cat: 2, type: "physical" },
  { title: "Global Space Conference on Climate Change (GLOC 2026)", slug: "gloc-2026", desc: "Climate-focused space conference, June 2-4, 2026", location: "Location TBD", start: "2026-06-02", end: "2026-06-04", cat: 1, type: "physical" },
  { title: "International Space Summit Africa", slug: "international-space-summit-africa-2026", desc: "Regional summit for African space industry, June 2-4, 2026", location: "Pretoria, South Africa", start: "2026-06-02", end: "2026-06-04", cat: 1, type: "physical" },
  { title: "Space Tech Expo USA", slug: "space-tech-expo-usa-2026", desc: "Space technology trade exposition, June 2-4, 2026", location: "Anaheim Convention Center, Anaheim, California, USA", start: "2026-06-02", end: "2026-06-04", cat: 1, type: "physical" },
  { title: "International Space Development Conference (ISDC)", slug: "isdc-2026", desc: "Development-focused space conference, June 4-7, 2026", location: "Hilton McLean Tysons Corner, McLean, Virginia, USA", start: "2026-06-04", end: "2026-06-07", cat: 1, type: "physical" },
  { title: "ICSOS Copenhagen", slug: "icsos-copenhagen-june-2026", desc: "Technical conference on space optical systems, June 8-9, 2026", location: "Copenhagen, Denmark", meetingUrl: "https://icsos.org/virtual", start: "2026-06-08", end: "2026-06-09", cat: 1, type: "hybrid" },
  { title: "Space & Satellites USA 2026", slug: "space-satellites-usa-2026", desc: "Major satellite trade conference, June 8-9, 2026", location: "Washington Marriott at Metro Center, Washington, DC, USA", start: "2026-06-08", end: "2026-06-09", cat: 1, type: "physical" },
  { title: "Global Satellite Servicing Forum", slug: "global-satellite-servicing-forum-2026", desc: "Specialized forum on satellite servicing, June 9-11, 2026", location: "Chantilly, Virginia, USA", start: "2026-06-09", end: "2026-06-11", cat: 1, type: "physical" },
  { title: "ILA Berlin", slug: "ila-berlin-2026", desc: "Major international air and space show, June 10-14, 2026", location: "BER Airport, Berlin, Germany", start: "2026-06-10", end: "2026-06-14", cat: 1, type: "physical" },
  { title: "MilSatCom USA", slug: "milsatcom-usa-2026", desc: "Military satellite communications conference, June 10-11, 2026", location: "Arlington, Virginia, USA", start: "2026-06-10", end: "2026-06-11", cat: 1, type: "physical" },
  { title: "MAST Focus Forum USA", slug: "mast-focus-forum-usa-2026", desc: "Specialized forum, June 24-25, 2026", location: "Waikiki, Hawaii, USA", start: "2026-06-24", end: "2026-06-25", cat: 1, type: "physical" },

  // July-September 2026
  { title: "Farnborough International Air Show", slug: "farnborough-2026", desc: "Major international air and space show, July 20-24, 2026", location: "Farnborough, UK", start: "2026-07-20", end: "2026-07-24", cat: 1, type: "physical" },
  { title: "COSPAR Scientific Assembly", slug: "cospar-2026", desc: "Major scientific assembly on space research, August 1-9, 2026", location: "Florence, Italy", start: "2026-08-01", end: "2026-08-09", cat: 1, type: "physical" },
  { title: "3rd International Conference on AI Sensors and Transducers", slug: "ais-2026", desc: "AI and sensor technology conference, August 2-7, 2026", location: "Jeju, Korea", start: "2026-08-02", end: "2026-08-07", cat: 1, type: "physical" },
  { title: "IBC", slug: "ibc-2026", desc: "International broadcast technology conference, September 11-14, 2026", location: "RAI, Amsterdam, The Netherlands", start: "2026-09-11", end: "2026-09-14", cat: 1, type: "physical" },
  { title: "World Space Business Week", slug: "world-space-business-week-2026", desc: "Major space business industry week, September 14-18, 2026", location: "Paris, France", start: "2026-09-14", end: "2026-09-18", cat: 1, type: "physical" },
  { title: "Space Defense and Security Summit", slug: "space-defense-security-summit-2026", desc: "Defense and security summit, September 15-16, 2026", location: "Paris, France", start: "2026-09-15", end: "2026-09-16", cat: 1, type: "physical" },
  { title: "Industry Space Days", slug: "industry-space-days-2026", desc: "Industry days at ESTEC, September 16-17, 2026", location: "ESTEC, Noordwijk, The Netherlands", start: "2026-09-16", end: "2026-09-17", cat: 1, type: "physical" },
  { title: "Space Innovation Summit", slug: "space-innovation-summit-2026", desc: "Innovation-focused summit, September 17, 2026", location: "Hôtel du Collectionneur, Paris, France", start: "2026-09-17", end: "2026-09-17", cat: 1, type: "physical" },
  { title: "Texas Space Summit", slug: "texas-space-summit-2026", desc: "Regional space summit for Texas, September 21-23, 2026", location: "Henry B. González Convention Center, San Antonio, Texas, USA", start: "2026-09-21", end: "2026-09-23", cat: 1, type: "physical" },
  { title: "RADECS", slug: "radecs-2026", desc: "Technical conference on radiation effects, September 28-October 2, 2026", location: "Prague, Czech Republic", start: "2026-09-28", end: "2026-10-02", cat: 1, type: "physical" },
  { title: "EARSeL Symposium", slug: "earsel-symposium-2026", desc: "Scientific symposium on remote sensing, September 29-October 2, 2026", location: "Department of Geography, Harokopio University of Athens, Athens, Greece", start: "2026-09-29", end: "2026-10-02", cat: 1, type: "physical" },
  { title: "Strategies in Satellite Ground Segment Conference", slug: "satellite-ground-segment-2026", desc: "Specialized conference on satellite ground segments, September 30-October 1, 2026", location: "Park Plaza Victoria, London, UK", start: "2026-09-30", end: "2026-10-01", cat: 1, type: "physical" },

  // October-November 2026
  { title: "International Astronautical Congress", slug: "iac-2026", desc: "Premier international space industry congress, October 5-9, 2026", location: "Antalya, Türkiye", start: "2026-10-05", end: "2026-10-09", cat: 1, type: "physical" },
  { title: "Space Passive Components Days", slug: "spcd-2026", desc: "Technical symposium on space components, October 13-16, 2026", location: "ESA/ESTEC, Noordwijk, The Netherlands", start: "2026-10-13", end: "2026-10-16", cat: 1, type: "physical" },
  { title: "5th Geospatial and Space Technology Forum", slug: "geospatial-space-tech-forum-2026", desc: "Geospatial technology forum, October 27-28, 2026", location: "Riyadh, Saudi Arabia", start: "2026-10-27", end: "2026-10-28", cat: 1, type: "physical" },
  { title: "Global MilSatCom", slug: "global-milsatcom-2026", desc: "Global military satellite communications conference, November 2-5, 2026", location: "London, UK", start: "2026-11-02", end: "2026-11-05", cat: 1, type: "physical" },
  { title: "Space Simulation Conference", slug: "space-simulation-conference-2026", desc: "Technical conference on space simulation, November 16-19, 2026", location: "Annapolis, Maryland, USA", start: "2026-11-16", end: "2026-11-19", cat: 1, type: "physical" },
  { title: "Space Tech Expo Europe", slug: "space-tech-expo-europe-2026", desc: "European space technology trade exposition, November 17-19, 2026", location: "Bremen, Germany", start: "2026-11-17", end: "2026-11-19", cat: 1, type: "physical" }
];

const userId = "ddb9fe22-0b00-4a70-9388-4a2959dc6c65";
const imageUrl = "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&h=600&fit=crop";

const values = events.map(e => {
  const title = e.title.replace(/'/g, "''");
  const desc = e.desc.replace(/'/g, "''");
  const loc = e.location ? `'${e.location.replace(/'/g, "''")}'` : "NULL";
  const meetingUrl = e.meetingUrl ? `'${e.meetingUrl}'` : "NULL";
  return `('${title}', '${e.slug}', '${desc}', '${userId}', ${e.cat}, '${e.type}', ${loc}, ${meetingUrl}, '${e.start} 09:00:00+00', '${e.end} 17:00:00+00', 'UTC', 'published', '${imageUrl}')`;
}).join(',\n');

console.log(`INSERT INTO events (title, slug, description, owner_id, category_id, location_type, address, meeting_url, start_datetime, end_datetime, timezone, status, image_url)
VALUES
${values};`);
