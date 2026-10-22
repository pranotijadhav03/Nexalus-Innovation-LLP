import {
  Brand,
  ProductCategory,
  Product,
  InternetPlan,
  BroadbandProvider,
  BroadbandPlan,
  Service,
  Project,
  Enquiry,
  ServiceArea,
  FAQ,
  AdminUser,
  SiteBanner,
  SeoSettings,
  TeamMember
} from '../types';

export const initialBrands: Brand[] = [
  {
    id: 'nexalus-innovations',
    name: 'Nexalus Innovations',
    tagline: 'Turnkey CCTV Surveillance, High-Speed Optical Fiber Internet & Enterprise Networking',
    shortDescription: 'Premier technology and enterprise infrastructure provider under Nexalus Innovations LLP, delivering certified CCTV security systems, high-speed optical fiber internet, and enterprise networking hardware.',
    fullDescription: 'Nexalus Innovations operates as a premier multi-sector technology and enterprise infrastructure provider under Nexalus Innovations LLP. Our technical portfolio encompasses high-performance AI CCTV surveillance systems, high-speed Gigabit optical fiber broadband, and enterprise IT networking infrastructure.',
    slug: 'nexalus-innovations',
    primaryColor: '#0284c7', // Sky / Navy
    accentColor: '#0369a1',
    contactEmail: 'innovations@nexalusinnovations.com',
    contactPhone: '+91 9158886444 / +91 (0) 80 4123 4567',
    websitePath: '/brands/nexalus-innovations',
    published: true,
    features: [
      '4K AI CCTV Surveillance Systems & NVR Storage',
      'High-Speed Gigabit Optical Fiber Internet (FTTH)',
      'Enterprise Managed Switches & UTM Firewalls',
      'Server Racks & Structured Cat6/Fiber Cabling',
      '24/7 Technical Support & Onsite Engineering SLA'
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'am-distributors',
    name: 'A.M. Distributors Chiplun',
    tagline: 'Packaged Mineral Water, Commercial Ice Cream & Complete Dairy Distribution in Chiplun',
    shortDescription: 'Dedicated regional cold-chain and commercial distributor based in Chiplun. Managing temperature-controlled logistics for packaged mineral water, commercial ice cream, and all dairy products including milk and butter.',
    fullDescription: 'A.M. Distributors Chiplun serves as the dedicated regional distribution powerhouse under Nexalus Innovations LLP. Operating from Chiplun, Maharashtra, the division commands specialized refrigerated fleets, cold-room storage, and reliable daily delivery routes for pure packaged mineral water, commercial ice cream brands, farm-fresh milk, butter, and complete dairy lines.',
    slug: 'am-distributors',
    primaryColor: '#0d9488',
    accentColor: '#0f766e',
    contactEmail: 'amdistributors.chiplun@nexalusinnovations.com',
    contactPhone: '+91 9822334455 / +91 2355 252500',
    websitePath: '/brands/am-distributors',
    published: true,
    features: [
      'Packaged Mineral Water Distribution (20L Jars & Retail Bottles)',
      'Ice Cream Distributor (Refrigerated Fleet)',
      'Milk, Butter & All Dairy Products Distribution',
      'Chiplun Regional Cold-Chain Warehouse & Logistics Hub',
      'Daily Doorstep & Institutional Supply SLA'
    ],
    updatedAt: new Date().toISOString()
  }
];

export const initialCategories: ProductCategory[] = [
  // Nexalus Innovations LLP Corporate Parent Categories
  { id: 'cat-corp-infra', brandId: 'nexalus', name: 'Turnkey IT & Security Infrastructure', slug: 'turnkey-it-security-infra', description: 'Enterprise turnkey fiber backbone, multi-WAN switching, and centralized facility surveillance architecture.' },
  { id: 'cat-corp-enterprise', brandId: 'nexalus', name: 'Corporate Networking & Security Solutions', slug: 'corporate-networking-security', description: 'Enterprise-grade structured cabling systems, core server switching, and high-availability solutions.' },

  // Nexalus Innovations Categories (CCTV, Internet, Networking, Cabling)
  { id: 'cat-nex-cctv', brandId: 'nexalus-innovations', name: 'AI CCTV & Surveillance Systems', slug: 'cctv-surveillance', description: 'Commercial 4K CCTV surveillance cameras, NVR servers, and video monitoring hardware.' },
  { id: 'cat-nex-internet', brandId: 'nexalus-innovations', name: 'High-Speed Fiber Internet & Routers', slug: 'fiber-internet', description: 'Gigabit fiber optical terminal routers, mesh Wi-Fi, and broadband equipment.' },
  { id: 'cat-nex-networking', brandId: 'nexalus-innovations', name: 'Enterprise Networking & Switches', slug: 'networking-switches', description: 'Layer-2/Layer-3 managed PoE+ switches, firewalls, and server racks.' },
  { id: 'cat-nex-electronics', brandId: 'nexalus-innovations', name: 'Structured Cabling & Hardware', slug: 'cabling-hardware', description: 'Pure copper Cat6A drums, patch panels, connectors, and precision tools.' },

  // A.M. Distributors Chiplun Categories (Cold-Chain, Water, Ice Cream, Dairy)
  { id: 'cat-am-water', brandId: 'am-distributors', name: 'Packaged Mineral Water (Chiplun)', slug: 'am-mineral-water', description: 'Purified mineral water in 20L jars and retail bottle crates.' },
  { id: 'cat-am-icecream', brandId: 'am-distributors', name: 'Ice Cream Distribution', slug: 'ice-cream', description: 'Cold-chain distributed ice cream tubs, cones, and novelty packs.' },
  { id: 'cat-am-dairy', brandId: 'am-distributors', name: 'Milk, Butter & All Dairy Products', slug: 'dairy-products', description: 'Pasteurized fresh milk, pure butter, cheese, and complete dairy supplies.' }
];

export const initialProducts: Product[] = [
  // Nexalus Innovations LLP Corporate Parent Products
  {
    id: 'prod-corp-1',
    brandId: 'nexalus',
    name: 'Turnkey Optical Fiber Backbone & Campus Network Architecture',
    slug: 'turnkey-optical-fiber-backbone-campus',
    modelNumber: 'NEX-CORP-FTTH-BB',
    categoryId: 'cat-corp-infra',
    categoryName: 'Turnkey IT & Security Infrastructure',
    description: 'Enterprise turnkey fiber optical backbone installation with 10G optical uplinks, fusion splicing, and centralized patch room distribution.',
    specifications: {
      'Category': 'Turnkey IT & Security Infrastructure',
      'Optical Core': '12/24-Core Single Mode Outdoor Armored Fiber',
      'Bandwidth': 'Up to 10 Gbps SFP+ Non-Blocking Backplane',
      'Deployment': 'Commercial Complexes, Industrial Parks & Campuses',
      'SLA Support': '24/7 Dedicated Network Operation Center (NOC)'
    },
    images: ['/images/products/fiber-ont.jpg'],
    price: 65000,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-corp-2',
    brandId: 'nexalus',
    name: 'Enterprise Integrated Surveillance & Security Command Center Fabric',
    slug: 'enterprise-surveillance-command-center-fabric',
    modelNumber: 'NEX-CORP-SEC-CMD',
    categoryId: 'cat-corp-infra',
    categoryName: 'Turnkey IT & Security Infrastructure',
    description: 'High-availability unified security fabric connecting multi-facility 4K CCTV surveillance feeds to a centralized monitoring and AI analytics hub.',
    specifications: {
      'Capacity': '64 to 128 Channels 4K Real-Time Stream Ingestion',
      'Redundancy': 'Dual Hot-Swappable Enterprise Power Supplies & RAID-6',
      'Analytics': 'Perimeter Intrusion, License Plate Recognition & Facial AI',
      'Integration': 'Unified Cloud Mobile + On-Premises Monitoring Console'
    },
    images: ['/images/products/cp-nvr.jpg'],
    price: 115000,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-corp-3',
    brandId: 'nexalus',
    name: 'High-Density Structured Cat6A Pure Copper Cabling System',
    slug: 'high-density-structured-cat6a-cabling-system',
    modelNumber: 'NEX-CORP-CAT6A-HD',
    categoryId: 'cat-corp-enterprise',
    categoryName: 'Corporate Networking & Security Solutions',
    description: '100% solid oxygen-free copper 10-Gigabit certified Cat6A cabling infrastructure with industrial keystones, 48-port patch panels, and Fluke channel certification.',
    specifications: {
      'Rating': 'TIA/EIA 568-C.2 Cat6A 10G Standard (500 MHz)',
      'Jacket': 'Low Smoke Zero Halogen (LSZH) Fire Retardant',
      'Warranty': '25-Year Performance & Component Warranty'
    },
    images: ['/images/products/cat6-cable.jpg'],
    price: 24500,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Nexalus Innovations Division Products
  {
    id: 'prod-nex-1',
    brandId: 'nexalus-innovations',
    name: '4K Ultra-HD AI Network CCTV Surveillance Dome Camera',
    slug: 'nex-4k-ai-cctv-dome',
    modelNumber: 'NEX-CCTV-4K-DOME',
    categoryId: 'cat-nex-cctv',
    categoryName: 'Sales & Networking (CCTV)',
    description: 'Commercial 4K Ultra-HD surveillance dome camera with Starlight full-color night vision, AI tripwire perimeter detection, built-in mic, and motorized optical zoom.',
    specifications: {
      'Category': 'Sales & Networking (CCTV)',
      'Resolution': '4K Ultra-HD (3840 × 2160) @ 30fps',
      'Night Vision': 'Starlight Full Color up to 40m',
      'Protection': 'IP67 Weatherproof & IK10 Vandal-Proof',
      'Power': 'PoE+ (802.3at) / 12V DC',
      'Analytics': 'AI Human/Vehicle Classification'
    },
    images: ['/images/products/cp-dome.jpg'],
    price: 5400,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-nex-2',
    brandId: 'nexalus-innovations',
    name: 'Enterprise 24-Port Gigabit Managed PoE+ Switch & Router',
    slug: 'nex-24p-gigabit-poe-switch',
    modelNumber: 'NEX-NET-24POE-L3',
    categoryId: 'cat-nex-cctv',
    categoryName: 'Sales & Networking (CCTV)',
    description: 'High-bandwidth 24-Port Gigabit Managed Layer-3 PoE+ switch with 4x 10G SFP+ uplinks, 370W total PoE budget, and enterprise VLAN routing for CCTV & IT networks.',
    specifications: {
      'Ports': '24x 10/100/1000 Mbps RJ45 PoE+ ports',
      'Uplinks': '4x 10G SFP+ optical fiber uplink slots',
      'PoE Power Budget': '370 Watts total high-capacity power',
      'Switching Capacity': '128 Gbps non-blocking backplane',
      'Warranty': '3 Years Direct Replacement SLA'
    },
    images: ['/images/products/poe-switch.jpg'],
    price: 18500,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-nex-3',
    brandId: 'nexalus-innovations',
    name: 'Industrial Electronics Material & Cat6A Splicing Hardware Drum',
    slug: 'nex-electronics-material-cat6a',
    modelNumber: 'NEX-ELEC-CAT6A-305M',
    categoryId: 'cat-nex-electronics',
    categoryName: 'Electronics Material',
    description: 'Pure oxygen-free copper 305m Cat6A shielded twisted pair cable drum with industrial termination accessories, RJ45 modular jacks, and installation splicing kits.',
    specifications: {
      'Material': '100% Solid Bare Electrolytic Copper (23 AWG)',
      'Bandwidth': '500 MHz certified up to 10 Gbps',
      'Length': '305 Meters (1000 ft) pull-box drum',
      'Testing': 'Fluke Channel Tested & Certified',
      'Applications': 'CCTV, Server Racks & Industrial Automation'
    },
    images: ['/images/products/cat6-cable.jpg'],
    price: 8900,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-nex-4',
    brandId: 'nexalus-innovations',
    name: 'NexFiber AX3000 Wi-Fi 6 Gigabit Optical Terminal ONT Router',
    slug: 'nexfiber-ax3000-wifi6-ont-router',
    modelNumber: 'NEX-ONT-AX3000',
    categoryId: 'cat-nex-internet',
    categoryName: 'High-Speed Fiber Internet & Routers',
    description: 'High-speed dual-band Wi-Fi 6 GPON optical network terminal (ONT) with 4 Gigabit Ethernet LAN ports, VoIP FXS port, and 3000 Mbps wireless speed for gigabit fiber connections.',
    specifications: {
      'Optical Interface': 'GPON SC/APC class B+ standard',
      'Wi-Fi Speed': 'AX3000 (2402 Mbps @ 5GHz + 574 Mbps @ 2.4GHz)',
      'LAN Ports': '4 × 10/100/1000 Mbps Gigabit RJ45 Ports',
      'Voice': '1 × RJ11 FXS VoIP telephone port',
      'Antennas': '4 × 5dBi High-Gain Omni Antennas'
    },
    images: ['/images/products/fiber-ont-v2.jpg'],
    price: 3850,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-nex-5',
    brandId: 'nexalus-innovations',
    name: 'Enterprise 32-Channel 4K AI Network Video Recorder (NVR)',
    slug: 'nex-32ch-4k-ai-nvr-server',
    modelNumber: 'NEX-NVR-4K-32CH',
    categoryId: 'cat-nex-cctv',
    categoryName: 'AI CCTV & Surveillance Systems',
    description: 'Commercial 32-Channel 4K Ultra HD AI Network Video Recorder supporting up to 4x 10TB SATA hard drives, dual HDMI outputs, face recognition, and remote smartphone monitoring.',
    specifications: {
      'Channels': '32 IP Channels up to 12MP/4K decoding',
      'Storage': '4 SATA III ports (up to 40TB total RAID support)',
      'Bandwidth': '384 Mbps incoming recording bandwidth',
      'AI Capabilities': 'Facial recognition, vehicle ANPR, perimeter tripwire',
      'Outputs': '2 × HDMI (4K Ultra-HD) + 1 × VGA'
    },
    images: ['/images/products/cp-nvr.jpg'],
    price: 28900,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // A.M. Distributors Chiplun Products
  {
    id: 'prod-am-1',
    brandId: 'am-distributors',
    name: 'Packaged Mineral Water 20-Litre Hermetic Dispenser Jar',
    slug: 'am-packaged-water-20l-jar',
    modelNumber: 'AM-WATER-20L-CAN',
    categoryId: 'cat-am-water',
    categoryName: 'Packaged Mineral Water (Chiplun)',
    description: 'Hygienically bottled 20-litre natural mineral water dispenser jar with tamper-evident seal. Daily morning doorstep route delivery across Chiplun city and surrounding industrial areas.',
    specifications: {
      'Volume': '20 Litre Heavy-Duty Food Grade Jar',
      'Quality': 'Bacteriologically Tested, Pure Mineral Balance',
      'Doorstep Routes': 'Chiplun Town, Khed, Guhagar & Industrial Zones',
      'Cleaning Cycle': 'Automated High-Pressure Steam Washed',
      'Subscription': 'Daily / Weekly Regular Office & Home Supply'
    },
    images: ['/images/products/am-water-jar-20l.jpg'],
    price: 85,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-am-2',
    brandId: 'am-distributors',
    name: 'Commercial Ice Cream Assortment (Bulk Tubs, Cones & Bars)',
    slug: 'am-ice-cream-commercial-assortment',
    modelNumber: 'AM-ICECREAM-COLD-CHAIN',
    categoryId: 'cat-am-icecream',
    categoryName: 'Ice Cream Distribution',
    description: 'Complete commercial ice cream range distributed via certified -18°C refrigerated trucks. Supplies retail freezer cabinets, banquet halls, hotels, and restaurants in Chiplun.',
    specifications: {
      'Cold Chain': '-18°C Insulated & Refrigerated Fleet',
      'Product Types': 'Bulk 5L Tubs, Premium Waffle Cones, Chocobars',
      'Flavors': 'Vanilla, Mango, Chocolate, Butterscotch, Kulfi',
      'Supply Fleet': 'Temperature-Monitored Reefer Delivery Vans',
      'Coverage': 'Chiplun, Ratnagiri District & Konkan Belt'
    },
    images: ['/images/products/am-icecream-tub.jpg'],
    price: 360,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-am-3',
    brandId: 'am-distributors',
    name: 'Farm-Fresh Pasteurized Milk (500ml / 1L Daily Supply Crates)',
    slug: 'am-pasteurized-fresh-milk-crates',
    modelNumber: 'AM-DAIRY-MILK-CRATE',
    categoryId: 'cat-am-dairy',
    categoryName: 'Milk, Butter & All Dairy Products',
    description: 'Nutrient-rich, lab-tested pasteurized standardized cow and buffalo milk pouches packed in distribution crates. Daily 4:00 AM distribution fleet supply across Chiplun.',
    specifications: {
      'Packs': '500ml & 1000ml Heat-Sealed Pouches (12/24 units per crate)',
      'Fat / SNF Content': 'Standardized Fat 4.5%, SNF 8.5%',
      'Distribution Slot': 'Daily Early Morning 4:00 AM – 7:00 AM',
      'Clients': 'Dairy Outlets, Groceries, Hospitals & Residential Societies',
      'Quality Compliance': 'Daily Microbiological & Chilling Audits'
    },
    images: ['/images/products/am-fresh-milk-dairy.jpg'],
    price: 34,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-am-4',
    brandId: 'am-distributors',
    name: 'Pure Churned Table Butter, Ghee & Processed Cheese Blocks',
    slug: 'am-pure-butter-cheese-dairy-pack',
    modelNumber: 'AM-DAIRY-BUTTER-CHEESE',
    categoryId: 'cat-am-dairy',
    categoryName: 'Milk, Butter & All Dairy Products',
    description: 'Golden table butter, pure cow ghee, and cheddar cheese blocks for institutional caterers, bakeries, cafes, and supermarkets throughout Chiplun and Konkan.',
    specifications: {
      'Varieties': 'Salted Table Butter (100g, 500g), Pure Desi Cow Ghee (1L)',
      'Cheese Blocks': '1kg & 2.5kg Processed Block Cheese',
      'Chilling Standard': 'Maintained at 0°C to 4°C in Chiplun Cold Depot',
      'FSSAI Certified': '100% Genuine Dairy Quality Guarantee',
      'Ordering': 'Daily Wholesale Dispatch & Retail replenishment'
    },
    images: ['/images/projects/am-distributors-chiplun.jpg'],
    price: 275,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // CP PLUS Products
  {
    id: 'prod-cp-1',
    brandId: 'cp-plus',
    name: 'CP-UNC-TA41ZL4-MDS 4MP Smart IR Network Bullet Camera',
    slug: 'cp-unc-ta41zl4-mds-4mp-bullet',
    modelNumber: 'CP-UNC-TA41ZL4-MDS',
    categoryId: 'cat-bullet',
    categoryName: 'Bullet Cameras',
    description: 'High-performance 4 Megapixel outdoor network bullet camera featuring motorized varifocal lens, Starlight low-light sensitivity, and AI perimeter intrusion detection.',
    specifications: {
      'Resolution': '4 Megapixel (2560 × 1440) @ 30fps',
      'Lens': '2.7mm–13.5mm Motorized Varifocal',
      'IR Distance': 'Up to 60 Meters Smart IR',
      'Ingress Protection': 'IP67 Weatherproof rating',
      'Video Compression': 'H.265+ / H.264+ dual stream',
      'Power': 'PoE (802.3af) / 12V DC',
      'Smart Features': 'Tripwire, Intrusion, Human & Vehicle filtering'
    },
    images: [
      '/images/products/cp-bullet.jpg'
    ],
    price: 6850,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-cp-2',
    brandId: 'cp-plus',
    name: 'CP-UNC-DA41L3 4MP Full-Color Starlight Fixed Dome Camera',
    slug: 'cp-unc-da41l3-4mp-dome',
    modelNumber: 'CP-UNC-DA41L3',
    categoryId: 'cat-dome',
    categoryName: 'Dome Cameras',
    description: '24/7 Full-Color dome surveillance camera with warm white LED supplemental lighting, built-in microphone for synchronized audio, and vandal-proof dome casing.',
    specifications: {
      'Resolution': '4 MP (2688 × 1520)',
      'Lens': '2.8mm Fixed Aperture F1.0',
      'Night Vision': 'Full Color 24/7 up to 30 Meters',
      'Audio': 'Built-in High Sensitivity Microphone',
      'Protection': 'IK10 Vandal-Resistant & IP67',
      'Storage': 'MicroSD card slot up to 256GB'
    },
    images: [
      '/images/products/cp-dome.jpg'
    ],
    price: 4950,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-cp-3',
    brandId: 'cp-plus',
    name: 'CP-UNR-416T2-V2 16-Channel 4K Network Video Recorder (NVR)',
    slug: 'cp-unr-416t2-v2-16ch-4k-nvr',
    modelNumber: 'CP-UNR-416T2-V2',
    categoryId: 'cat-nvr',
    categoryName: 'DVR & NVR Systems',
    description: 'Ultra HD 16-channel standalone network video recorder with 4K HDMI output, dual SATA interfaces up to 20TB storage, and remote cloud surveillance app.',
    specifications: {
      'Channels': '16 IP Channels up to 8MP/4K decoding',
      'Storage': '2 SATA III ports (up to 10TB per HDD)',
      'Video Outputs': '1 HDMI (4K 3840×2160) + 1 VGA',
      'Network Bandwidth': '160 Mbps incoming',
      'Remote Access': 'CP PLUS gCMOB / iCMOB Mobile App & CMS',
      'Smart Search': 'Event-driven playback and backup'
    },
    images: [
      '/images/products/cp-nvr.jpg'
    ],
    price: 11200,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-cp-4',
    brandId: 'cp-plus',
    name: 'CP-V34G 4G Smart Wireless Pan-Tilt Cloud Camera',
    slug: 'cp-v34g-4g-smart-pt-camera',
    modelNumber: 'CP-V34G',
    categoryId: 'cat-ip',
    categoryName: 'IP & Smart AI Cameras',
    description: 'Standalone 4G SIM-card enabled wireless pan-tilt camera with solar support, motion tracking, siren alert, and two-way voice communication for remote sites.',
    specifications: {
      'Connectivity': '4G LTE SIM Card slot (No Wi-Fi needed)',
      'Resolution': '3 Megapixel 2K QHD',
      'Rotation': '355° Pan, 90° Tilt',
      'Audio': 'Two-way talk with noise suppression',
      'Battery / Solar': 'Optional solar panel compatible',
      'Smart Alert': 'Human detection push notifications'
    },
    images: [
      '/images/products/cp-v34g.jpg'
    ],
    price: 3890,
    currency: 'INR',
    availability: 'in_stock',
    featured: false,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-cp-5',
    brandId: 'cp-plus',
    name: 'CP-UNP-E3321L20-MS 32x 4K Ultra-HD Network IR PTZ Speed Dome Camera',
    slug: 'cp-unp-e3321l20-ms-32x-ptz',
    modelNumber: 'CP-UNP-E3321L20-MS',
    categoryId: 'cat-ptz',
    categoryName: 'PTZ Speed Domes',
    description: 'Industrial grade 32x optical zoom pan-tilt-zoom camera with 200m Smart IR illumination, 360° continuous rotation, optical defog, and intelligent auto-tracking.',
    specifications: {
      'Optical Zoom': '32× Optical Zoom (4.8mm–154mm)',
      'Resolution': '4K Ultra HD (3840 × 2160)',
      'IR Distance': 'Up to 200 Meters Intelligent IR',
      'Pan / Tilt Range': '360° endless pan, -15° to 90° tilt',
      'Auto Tracking': 'Deep-learning human & vehicle auto-tracking',
      'Protection': 'IP67 Weatherproof & IK10 Vandal Resistant'
    },
    images: [
      '/images/products/cp-ptz.jpg'
    ],
    price: 38500,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-cp-6',
    brandId: 'cp-plus',
    name: 'CP-VPA-TC741 7-inch Smart IP Video Door Phone & Access Terminal',
    slug: 'cp-vpa-tc741-7inch-video-door-phone',
    modelNumber: 'CP-VPA-TC741',
    categoryId: 'cat-access',
    categoryName: 'Access Control & Intercom',
    description: 'Touchscreen indoor monitor and outdoor video intercom station with RFID card access, mobile app unlock, crystal clear two-way audio, and CCTV camera integration.',
    specifications: {
      'Display': '7-inch Capacitive Color Touchscreen',
      'Outdoor Camera': '2MP Full HD with Night Vision',
      'Access Methods': 'RFID Card, Mobile App, Remote Door Release',
      'Network': 'Standard PoE / Wi-Fi connectivity',
      'Integration': 'Live view of external CP PLUS IP cameras'
    },
    images: [
      '/images/products/cp-vdp.jpg'
    ],
    price: 14200,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-cp-7',
    brandId: 'cp-plus',
    name: 'CP-UNR-432T4-V2 32-Channel 4K Enterprise AI Network Video Recorder',
    slug: 'cp-unr-432t4-v2-32ch-enterprise-nvr',
    modelNumber: 'CP-UNR-432T4-V2',
    categoryId: 'cat-nvr',
    categoryName: 'DVR & NVR Systems',
    description: 'High-density 32-channel commercial NVR with 4 SATA bays up to 40TB, face recognition database, license plate recognition, and dual Gigabit LAN ports.',
    specifications: {
      'Channels': '32 IP Channels up to 12MP decoding',
      'HDD Capacity': '4 SATA ports (up to 10TB per HDD, 40TB total)',
      'AI Processing': 'Facial recognition & vehicle ANPR supported',
      'Bandwidth': '256 Mbps incoming bandwidth',
      'Redundancy': 'RAID 0/1/5/6/10 support'
    },
    images: [
      '/images/products/cp-nvr.jpg'
    ],
    price: 24900,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-cp-8',
    brandId: 'cp-plus',
    name: 'CP-E25A 2MP Smart Wi-Fi 360° Pan-Tilt Home Security Camera',
    slug: 'cp-e25a-2mp-smart-pt-camera',
    modelNumber: 'CP-E25A',
    categoryId: 'cat-ip',
    categoryName: 'IP & Smart AI Cameras',
    description: 'Affordable wireless smart camera with 360° panoramic view, human body detection, two-way voice call, privacy mode, and Amazon Alexa / Google Assistant integration.',
    specifications: {
      'Resolution': '1080P Full HD (1920 × 1080)',
      'Pan / Tilt': '355° Horizontal Pan, 85° Vertical Tilt',
      'Audio': 'Full duplex two-way talk with echo cancellation',
      'Storage': 'Up to 128GB MicroSD + Cloud Backup',
      'Smart Voice': 'Works with Alexa and Google Assistant'
    },
    images: [
      '/images/products/cp-e25a.jpg'
    ],
    price: 1999,
    currency: 'INR',
    availability: 'in_stock',
    featured: false,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // One Broadband Internet Products (100% Internet & FTTH Equipment)
  {
    id: 'prod-ob-1',
    brandId: 'one-broadband',
    name: 'NexFiber Wi-Fi 6 AX3000 Dual-Band Gigabit ONT Router',
    slug: 'nexfiber-wifi-6-ax3000-ont-router',
    modelNumber: 'OB-AX3000-ONT',
    categoryId: 'cat-routers',
    categoryName: 'Fiber ONT & Routers',
    description: 'High-speed GPON Optical Network Terminal with built-in Wi-Fi 6, 4 Gigabit Ethernet LAN ports, VoIP FXS port, and OFDMA low-latency technology for high-speed fiber internet.',
    specifications: {
      'Wi-Fi Standard': 'Wi-Fi 6 (802.11ax) dual-band',
      'Throughput': 'Up to 2402 Mbps (5GHz) + 574 Mbps (2.4GHz)',
      'WAN Interface': 'GPON SC/UPC optical fiber port',
      'LAN Ports': '4 × 10/100/1000 Mbps Gigabit Ports',
      'Antennas': '4 × 5dBi High-Gain External Antennas',
      'Mesh Support': 'EasyMesh compatible for whole-home coverage'
    },
    images: [
      '/images/products/wifi6-router.jpg'
    ],
    price: 4200,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-ob-2',
    brandId: 'one-broadband',
    name: 'NexMesh AX3000 Whole-Home Tri-Band Wi-Fi 6 Mesh System (3-Pack)',
    slug: 'nexmesh-ax3000-whole-home-mesh-system',
    modelNumber: 'OB-MESH-AX3000-3PK',
    categoryId: 'cat-mesh',
    categoryName: 'Mesh Wi-Fi Systems',
    description: 'Whole-home dead-zone killer mesh Wi-Fi system covering up to 6,000 sq.ft. with seamless single-SSID roaming, gigabit Ethernet backhaul, and zero buffering for 100+ connected devices.',
    specifications: {
      'Coverage': 'Up to 6,000 sq.ft. across multiple floors',
      'Speed': 'AX3000 Dual-Band Wi-Fi 6',
      'Pack Size': '3 Pre-paired mesh nodes',
      'Backhaul': 'Wireless or Gigabit Ethernet backhaul supported',
      'Security': 'WPA3 encryption & guest network isolation'
    },
    images: [
      '/images/products/mesh-wifi-v2.jpg'
    ],
    price: 11999,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-ob-3',
    brandId: 'one-broadband',
    name: 'NexFiber Gigabit XPON / GPON Optical Fiber Bridge Modem (ONU)',
    slug: 'nexfiber-gigabit-xpon-onu-modem',
    modelNumber: 'OB-ONU-1000G',
    categoryId: 'cat-onu',
    categoryName: 'Fiber Modems & ONUs',
    description: 'Ultra-compact high-speed Gigabit XPON/GPON optical network terminal (ONU) with 1 SC/UPC optical port, 1 Gigabit RJ45 LAN port, bridge mode, and lightning surge protection.',
    specifications: {
      'Optical Standard': 'ITU-T G.984 GPON & IEEE 802.3ah EPON dual-mode',
      'Optical Port': '1 × SC/UPC single-mode fiber port',
      'LAN Interface': '1 × 10/100/1000 Mbps Gigabit Ethernet port',
      'Throughput': 'Up to 2.488 Gbps downstream / 1.244 Gbps upstream',
      'Power': '12V DC adapter included with energy-saving mode'
    },
    images: [
      '/images/products/fiber-modem.jpg'
    ],
    price: 1850,
    currency: 'INR',
    availability: 'in_stock',
    featured: false,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-ob-4',
    brandId: 'one-broadband',
    name: 'NexFiber AC1200 Dual-Band Smart FTTH Home Wi-Fi Router',
    slug: 'nexfiber-ac1200-home-router',
    modelNumber: 'OB-AC1200-HOME',
    categoryId: 'cat-routers',
    categoryName: 'Fiber ONT & Routers',
    description: 'High-speed dual-band AC1200 Wi-Fi router with 4 high-gain antennas, MU-MIMO beamforming, and fast Ethernet ports ideal for family streaming, video calls, and home broadband.',
    specifications: {
      'Speed': '867 Mbps (5GHz) + 300 Mbps (2.4GHz)',
      'Antennas': '4 × 5dBi High-Gain Omni Antennas',
      'Ethernet Ports': '1 × 1000M WAN + 3 × 1000M LAN Gigabit Ports',
      'Features': 'MU-MIMO, Beamforming, Parental Controls, Guest Wi-Fi'
    },
    images: [
      '/images/products/dualband-router.jpg'
    ],
    price: 2499,
    currency: 'INR',
    availability: 'in_stock',
    featured: false,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-ob-5',
    brandId: 'one-broadband',
    name: 'NexBoost Gigabit Dual-Band Wi-Fi 6 Range Extender & Repeater',
    slug: 'nexboost-wifi6-range-extender',
    modelNumber: 'OB-EXT-AX1800',
    categoryId: 'cat-extenders',
    categoryName: 'Wi-Fi Range Boosters',
    description: 'Wall-plug dual-band Wi-Fi range booster with external antennas and LED signal strength indicator to eliminate Wi-Fi dead spots in bedrooms, balconies, and home offices.',
    specifications: {
      'Speed': '1201 Mbps (5GHz) + 574 Mbps (2.4GHz)',
      'Coverage Boost': 'Adds up to 1,500 sq.ft. of Wi-Fi coverage',
      'Port': '1 × Gigabit Ethernet port for smart TV or PC cable connection',
      'Installation': 'One-touch WPS push-button setup'
    },
    images: [
      '/images/products/wifi-extender.jpg'
    ],
    price: 3250,
    currency: 'INR',
    availability: 'in_stock',
    featured: false,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-ob-6',
    brandId: 'one-broadband',
    name: 'NexFiber Ultra-Gigabit 2.5G Wi-Fi 6 Multi-Gig Home Gateway',
    slug: 'nexfiber-25g-multigig-wifi6-gateway',
    modelNumber: 'OB-AX6000-25G',
    categoryId: 'cat-routers',
    categoryName: 'Fiber ONT & Routers',
    description: 'Flagship 2.5Gbps multi-gigabit fiber gateway router featuring Wi-Fi 6 160MHz channels, low ping gaming prioritization, and parental controls for high-bandwidth households.',
    specifications: {
      'Throughput': 'Up to 4804 Mbps (5GHz) + 1148 Mbps (2.4GHz)',
      'Multi-Gig Port': '1 × 2.5 Gbps Multi-Gigabit WAN/LAN Port',
      'LAN Ports': '4 × 1 Gbps Gigabit Ethernet Ports + 1 × USB 3.0',
      'Processor': 'Quad-Core 2.0GHz 64-bit Network Processor'
    },
    images: [
      '/images/products/fiber-ont-v2.jpg'
    ],
    price: 8990,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // ITTI Enterprise Networking Products
  {
    id: 'prod-itti-1',
    brandId: 'itti-networking',
    name: 'Sophos XGS 2100 Next-Gen Hardware Firewall & UTM Security Gateway',
    slug: 'sophos-xgs-2100-next-gen-firewall',
    modelNumber: 'ITTI-XGS-2100',
    categoryId: 'cat-itti-security',
    categoryName: 'Firewalls & Cyber Security',
    description: 'Enterprise rackmount Next-Gen Firewall powered by Xstream dual-processor architecture with deep packet inspection, TLS 1.3 decryption, advanced SD-WAN, and zero-day threat protection.',
    specifications: {
      'Firewall Throughput': '35,000 Mbps non-blocking',
      'Threat Protection': '1,250 Mbps IPS / Antivirus inspection',
      'Ethernet Interfaces': '8 × GbE Copper + 2 × SFP Fiber + 1 Flexi Port Slot',
      'VPN Throughput': '3,000 Mbps IPSec VPN',
      'Form Factor': '1U Rackmount with redundant power option',
      'Partner Support': 'Authorized Sophos Certified Enterprise Partner'
    },
    images: [
      '/images/products/poe-switch.jpg'
    ],
    price: 98500,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-itti-2',
    brandId: 'itti-networking',
    name: 'ITTI 48-Port Gigabit Layer-3 Managed Core Switch with 4x 10G SFP+ Uplinks',
    slug: 'itti-48-port-layer3-core-switch',
    modelNumber: 'ITTI-SW-L3-48G',
    categoryId: 'cat-itti-switching',
    categoryName: 'L2/L3 Enterprise Switches',
    description: 'High-density enterprise Layer-3 core switch delivering 176 Gbps switching fabric, OSPF/BGP dynamic routing, static routing, DHCP server, and quad 10-Gigabit optical uplink ports.',
    specifications: {
      'Ports': '48 × 10/100/1000 Mbps RJ45 + 4 × 10G SFP+ Uplinks',
      'Switching Capacity': '176 Gbps wire-speed non-blocking',
      'Routing Protocols': 'Static Routing, RIP v1/v2, OSPF, BGP, VRRP',
      'Management': 'Console CLI, Web GUI, Telnet, SNMP v1/v2c/v3, RMON',
      'Quality of Service': '8 Priority queues per port with CoS/DSCP policing'
    },
    images: [
      '/images/products/poe-switch.jpg'
    ],
    price: 46200,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-itti-3',
    brandId: 'itti-networking',
    name: 'ITTI 24-Port 19-inch Rackmount Fiber Optic LIU Patch Panel (SC Duplex)',
    slug: 'itti-24-port-rackmount-fiber-liu-panel',
    modelNumber: 'ITTI-FO-LIU-24P',
    categoryId: 'cat-itti-fiber',
    categoryName: 'Fiber Infrastructure & LIU',
    description: 'Sliding rackmount Light Interface Unit (LIU) loaded with 24 SC Duplex single-mode adapters, splice trays, and cable management rings for clean campus fiber termination.',
    specifications: {
      'Capacity': '24 SC Duplex ports (supports up to 48 fiber cores)',
      'Mounting': 'Standard 19-inch 1U rack enclosure (cold-rolled steel)',
      'Accessories': 'Splice tray, cable gland, splice protection sleeves included',
      'Insertion Loss': '< 0.2 dB per optical port'
    },
    images: [
      '/images/products/sfp-transceiver.jpg'
    ],
    price: 4800,
    currency: 'INR',
    availability: 'in_stock',
    featured: false,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-itti-4',
    brandId: 'itti-networking',
    name: 'ITTI 24U Floor Standing Enterprise Server Rack Cabinet (600x800mm)',
    slug: 'itti-24u-floor-standing-server-rack',
    modelNumber: 'ITTI-RC-24U-800',
    categoryId: 'cat-itti-cabling',
    categoryName: 'Server Racks & Cabling',
    description: 'Heavy duty 24U network and server cabinet with perforated front and rear mesh doors for optimal thermal airflow, 4-way cooling fan unit, cable organizers, and castor wheels.',
    specifications: {
      'Form Factor': '24U Floor Standing (600mm width × 800mm depth)',
      'Load Rating': '800 kg static load capacity',
      'Cooling': '4 × AC 220V Roof Ventilation Fans included',
      'Security': 'Front & rear key cylinder swing locks, removable side panels',
      'Accessories': '2 × Fixed Equipment Shelves + 1 × 8-Way PDU Power Strip'
    },
    images: [
      '/images/products/server-rack.jpg'
    ],
    price: 21500,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-itti-5',
    brandId: 'itti-networking',
    name: 'ITTI 305-Meter 10Gbps Shielded Cat6A STP Pure Copper Network Cable Drum',
    slug: 'itti-305m-cat6a-stp-cable-drum',
    modelNumber: 'ITTI-CB-CAT6A-305',
    categoryId: 'cat-itti-cabling',
    categoryName: 'Server Racks & Cabling',
    description: '23 AWG solid bare pure copper 10-Gigabit Ethernet twisted pair cable roll with individual foil shielding (STP), LSZH flame retardant jacket, and 500 MHz test certification.',
    specifications: {
      'Conductor': '23 AWG Solid Bare Electrolytic Copper (100% Copper)',
      'Length': '305 Meters (1,000 Feet) in easy-pull wooden reel drum',
      'Bandwidth': 'Up to 500 MHz (Supports 10GBASE-T up to 100 meters)',
      'Jacket': 'Low Smoke Zero Halogen (LSZH) compliant',
      'Standard': 'ANSI/TIA-568-C.2, ISO/IEC 11801 Class EA'
    },
    images: [
      '/images/products/cat6-cable.jpg'
    ],
    price: 13500,
    currency: 'INR',
    availability: 'in_stock',
    featured: false,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-itti-6',
    brandId: 'itti-networking',
    name: 'ITTI NexGate 24-Port Gigabit Smart Managed PoE+ Switch',
    slug: 'itti-nexgate-24-port-gigabit-poe-switch',
    modelNumber: 'ITTI-GS24P-370W',
    categoryId: 'cat-itti-switching',
    categoryName: 'L2/L3 Enterprise Switches',
    description: 'Enterprise rackmount 24-port Gigabit PoE+ switch with 370W total power budget and 4 dedicated Gigabit SFP fiber uplink slots for scalable business networks.',
    specifications: {
      'Ports': '24 × 10/100/1000 Mbps RJ45 + 4 × 1G SFP slots',
      'PoE Standard': 'IEEE 802.3af/at (30W max per port)',
      'Total PoE Budget': '370W',
      'Switching Capacity': '56 Gbps non-blocking',
      'Management': 'Web GUI, VLAN, QoS, IGMP Snooping, SNMP',
      'Form Factor': '19-inch 1U Rackmountable with metal chassis'
    },
    images: [
      '/images/products/poe-switch.jpg'
    ],
    price: 18500,
    currency: 'INR',
    availability: 'in_stock',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-itti-7',
    brandId: 'itti-networking',
    name: 'ITTI NexRack 9U Wall Mount Enterprise Networking Server Cabinet',
    slug: 'itti-nexrack-9u-wall-mount-server-cabinet',
    modelNumber: 'ITTI-RACK-9U-600',
    categoryId: 'cat-itti-cabling',
    categoryName: 'Server Racks & Cabling',
    description: 'Heavy duty 19-inch 9U wall mount rack enclosure with toughened glass front door, lock & key security, cable entry glands, and cooling fan ventilation.',
    specifications: {
      'Size': '9U Standard 19-inch Rackmount (600mm depth)',
      'Construction': 'Cold-rolled SPCC steel sheet with powder coat',
      'Load Rating': 'Up to 60 kg static load capacity',
      'Door': 'Toughened transparent glass door with cylinder lock',
      'Included': '1U PDU power strip, 1 × fixed shelf, cage nuts'
    },
    images: [
      '/images/products/server-rack.jpg'
    ],
    price: 6400,
    currency: 'INR',
    availability: 'in_stock',
    featured: false,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-itti-8',
    brandId: 'itti-networking',
    name: 'ITTI NexOptic 10G SFP+ Optical Transceiver & Media Module',
    slug: 'itti-nexoptic-10g-sfp-transceiver',
    modelNumber: 'ITTI-SFP-10G-LR',
    categoryId: 'cat-itti-fiber',
    categoryName: 'Fiber Infrastructure & LIU',
    description: 'Hot-pluggable single-mode 10 Gigabit fiber optical transceiver module for high-throughput enterprise backbone campus links up to 10 kilometers.',
    specifications: {
      'Data Rate': '10 Gbps (10GBASE-LR)',
      'Wavelength': '1310nm Single-Mode Fiber',
      'Distance': 'Up to 10 km reach',
      'Connector': 'Dual LC optical interface',
      'Compatibility': 'MSA Compliant, Cisco / Mikrotik / Ubiquiti supported'
    },
    images: [
      '/images/products/sfp-transceiver.jpg'
    ],
    price: 2450,
    currency: 'INR',
    availability: 'in_stock',
    featured: false,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialInternetPlans: InternetPlan[] = [
  {
    id: 'plan-60',
    brandId: 'one-broadband',
    name: '60 MBPS UNLIMITED DATA',
    slug: '60-mbps-unlimited-data',
    speed: '60 Mbps',
    speedNumeric: 60,
    originalPrice: 850,
    price: 600,
    billingPeriod: 'monthly',
    dataAllowance: 'Truly Unlimited',
    image: '/images/internet-plan-cable.jpg',
    includedFeatures: [
      '60 Mbps Symmetrical Download & Upload',
      'Truly Unlimited Data with Zero FUP Limit',
      'Dual-Band Wi-Fi Router Included',
      'Buffer-Free 1080p FHD Video Streaming',
      '24/7 Rapid Helpdesk Support'
    ],
    availability: 'active',
    popular: false,
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'plan-100',
    brandId: 'one-broadband',
    name: '100 MBPS UNLIMITED DATA',
    slug: '100-mbps-unlimited-data',
    speed: '100 Mbps',
    speedNumeric: 100,
    originalPrice: 1200,
    price: 1100,
    billingPeriod: 'monthly',
    dataAllowance: 'Truly Unlimited',
    image: '/images/internet-plan-cable.jpg',
    includedFeatures: [
      '100 Mbps Symmetrical Pure Optical Fiber',
      'Truly Unlimited Data with Zero FUP Limit',
      'High-Power Gigabit Wi-Fi Router Included',
      'Smooth 4K OTT Streaming on Multiple Devices',
      'Optimized for Work From Home & Video Calls'
    ],
    availability: 'active',
    popular: true,
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'plan-150',
    brandId: 'one-broadband',
    name: '150 MBPS UNLIMITED DATA',
    slug: '150-mbps-unlimited-data',
    speed: '150 Mbps',
    speedNumeric: 150,
    originalPrice: 1700,
    price: 1500,
    billingPeriod: 'monthly',
    dataAllowance: 'Truly Unlimited',
    image: '/images/internet-plan-cable.jpg',
    includedFeatures: [
      '150 Mbps Symmetrical High-Throughput Fiber',
      'Truly Unlimited Data with Zero FUP Limit',
      'Dual-Band Gigabit Wi-Fi Router Included',
      'Simultaneous Multi-User Ultra-HD Streaming',
      'Priority Network Fault Resolution SLA'
    ],
    availability: 'active',
    popular: false,
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'plan-200',
    brandId: 'one-broadband',
    name: '200 MBPS UNLIMITED DATA',
    slug: '200-mbps-unlimited-data',
    speed: '200 Mbps',
    speedNumeric: 200,
    originalPrice: 2300,
    price: 2000,
    billingPeriod: 'monthly',
    dataAllowance: 'Truly Unlimited',
    image: '/images/internet-plan-cable.jpg',
    includedFeatures: [
      '200 Mbps Blazing Fast Symmetrical Speed',
      'Truly Unlimited Data with Zero FUP Limit',
      'Next-Gen AC/AX Wi-Fi Router Included',
      'Low Ping for Online Gaming & Cloud Sync',
      'Zero Throttling During Peak Evening Hours'
    ],
    availability: 'active',
    popular: false,
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'plan-300',
    brandId: 'one-broadband',
    name: '300 MBPS UNLIMITED DATA',
    slug: '300-mbps-unlimited-data',
    speed: '300 Mbps',
    speedNumeric: 300,
    originalPrice: 3300,
    price: 3000,
    billingPeriod: 'monthly',
    dataAllowance: 'Truly Unlimited',
    image: '/images/internet-plan-cable.jpg',
    includedFeatures: [
      '300 Mbps Ultra-High Bandwidth Symmetrical Fiber',
      'Truly Unlimited Data with Zero FUP Limit',
      'Premium Wi-Fi 6 Router Included',
      'Ultra-Low Latency Peering for Gaming & Creators',
      'Dedicated 4-Hour Response SLA'
    ],
    availability: 'active',
    popular: true,
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'plan-500',
    brandId: 'one-broadband',
    name: '500 MBPS UNLIMITED DATA',
    slug: '500-mbps-unlimited-data',
    speed: '500 Mbps',
    speedNumeric: 500,
    originalPrice: 5500,
    price: 5000,
    billingPeriod: 'monthly',
    dataAllowance: 'Truly Unlimited',
    image: '/images/internet-plan-cable.jpg',
    includedFeatures: [
      '500 Mbps Enterprise-Class Fiber Throughput',
      'Truly Unlimited Data with Zero FUP Limit',
      'Dual-Band Wi-Fi 6 Mesh Hardware Included',
      'Ideal for Tech Studios, Villas & Heavy File Uploads',
      'Dedicated Priority Account Support Desk'
    ],
    availability: 'active',
    popular: false,
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'plan-1000',
    brandId: 'one-broadband',
    name: '1 GBPS UNLIMITED DATA',
    slug: '1-gbps-unlimited-data',
    speed: '1 Gbps (1000 Mbps)',
    speedNumeric: 1000,
    originalPrice: 16000,
    price: 12000,
    billingPeriod: 'monthly',
    dataAllowance: 'Enterprise Truly Unlimited',
    image: '/images/internet-plan-cable.jpg',
    includedFeatures: [
      '1000 Mbps Pure Optical Dedicated Gigabit Pipe',
      'Enterprise SLA Guarantee with 99.9% Uptime',
      'Enterprise Optical Terminal & Dual-WAN Hardware',
      'Static Public IPv4 Address Included',
      '24/7/365 Direct VIP NOC Desk Support'
    ],
    availability: 'active',
    popular: false,
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialBroadbandProviders: BroadbandProvider[] = [
  {
    id: 'airtel',
    name: 'Airtel',
    slug: 'airtel',
    description: 'Airtel Xstream Fiber broadband services offering high-speed connectivity and entertainment benefits.',
    enabled: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'bsnl',
    name: 'BSNL',
    slug: 'bsnl',
    description: 'BSNL Bharat Fiber broadband services delivering dependable nationwide optical fiber coverage.',
    enabled: true,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'railwire',
    name: 'RailWire',
    slug: 'railwire',
    description: 'RailWire broadband services powered by RailTel Corporation of India with expansive regional connectivity.',
    enabled: true,
    displayOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialBroadbandPlans: BroadbandPlan[] = [];

export const initialServices: Service[] = [
  // Nexalus Integrated Solutions
  {
    id: 'srv-nex-1',
    brandId: 'nexalus',
    title: 'Integrated Enterprise IT & Security Infrastructure',
    slug: 'integrated-it-security-infrastructure',
    shortDescription: 'Unified deployment combining high-speed fiber backbone networks with smart CCTV monitoring for complete facility oversight.',
    fullDescription: 'Nexalus Innovations LLP architects turnkey IT and security infrastructure. Rather than managing separate vendors for CCTV surveillance and internet connectivity, our engineers design a cohesive structured cabling, switching, and monitoring ecosystem with single-window service and accountability.',
    iconName: 'Building2',
    features: [
      'Single-Contract Structured Cabling & Networking',
      'Optimized Bandwidth Allocation for Security Video Streams',
      'Unified Power Backup (UPS) & Equipment Racks',
      'Centralized Monitoring Operations Control Center',
      'Comprehensive Annual Maintenance Contracts (AMC)'
    ],
    targetAudience: ['Commercial Offices', 'Industrial Parks', 'Warehouses', 'Educational Campuses'],
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // CP PLUS Services
  {
    id: 'srv-cp-1',
    brandId: 'cp-plus',
    title: 'Turnkey CCTV Installation & Configuration',
    slug: 'turnkey-cctv-installation',
    shortDescription: 'Professional site survey, camera positioning, high-grade cabling, and multi-display control room configuration.',
    fullDescription: 'Our certified CP PLUS security engineers conduct physical site assessments to determine optimal focal points, eliminate blind spots, and install indoor/outdoor surveillance cameras using ISI-marked fire-retardant cabling and secure mounting hardware.',
    iconName: 'ShieldCheck',
    features: [
      'Comprehensive Site Vulnerability Assessment',
      'Neat Concealed Conduit & Weatherproof Wiring',
      'NVR Storage Optimization & Motion Scheduling',
      'Mobile App Configuration for Anywhere Viewing',
      'Onsite Handover & Staff Operation Training'
    ],
    targetAudience: ['Residential Villas', 'Retail Showrooms', 'Apartment Societies', 'Factories'],
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'srv-cp-2',
    brandId: 'cp-plus',
    title: 'Surveillance Maintenance & AMC Support',
    slug: 'surveillance-maintenance-amc',
    shortDescription: 'Proactive quarterly health audits, lens cleaning, storage integrity checks, and rapid repair dispatch.',
    fullDescription: 'Never let critical security cameras go offline unnoticed. Our preventive maintenance contracts cover scheduled camera diagnostics, power supply testing, firmware security updates, and urgent onsite breakdown replacement.',
    iconName: 'Wrench',
    features: [
      'Scheduled Quarterly Physical & Digital Audits',
      'Standby Equipment Provision During Major Repairs',
      '24-Hour Emergency Dispatch SLA',
      'Hard Disk Health & Recording Integrity Verification',
      'Transparent Logbooks & Maintenance Reports'
    ],
    targetAudience: ['Enterprises', 'Hospitals', 'Hotels', 'Residential Associations'],
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'srv-cp-3',
    brandId: 'cp-plus',
    title: 'Industrial & AI Video Analytics Setup',
    slug: 'industrial-ai-video-analytics',
    shortDescription: 'Smart automated surveillance featuring license plate recognition (ANPR), perimeter breach alerts, and facial verification.',
    fullDescription: 'Elevate passive recording to active prevention. We deploy edge-computing AI surveillance solutions that instantly trigger alarms upon detecting unauthorized entry, fire hazard indicators, vehicle registration matches, and queue congestion.',
    iconName: 'Cpu',
    features: [
      'Automatic Number Plate Recognition (ANPR)',
      'Perimeter Virtual Tripwire & Heatmap Analysis',
      'Facial Recognition for Access Control Gates',
      'Real-Time Push Alerts to Mobile & Control Center',
      'Integration with Fire Alarm & Access Doors'
    ],
    targetAudience: ['Toll Plazas', 'Manufacturing Units', 'Gated Communities', 'IT Parks'],
    featured: false,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // One Broadband Services
  {
    id: 'srv-ob-1',
    brandId: 'one-broadband',
    title: 'High-Speed Fiber Broadband Installation',
    slug: 'fiber-broadband-installation',
    shortDescription: 'Zero-downtime optical fiber deployment straight to your premises with gigabit-capable Wi-Fi routers.',
    fullDescription: 'Experience true fiber-optic performance with One Broadband. Our field technicians utilize precision fusion splicing to terminate low-loss optical fiber at your home or workplace, ensuring maximum signal throughput and lightning-fast web responsiveness.',
    iconName: 'Wifi',
    features: [
      'Fast 24-to-48 Hour Onsite Connection Turnaround',
      'Precision Fiber Optic Fusion Splicing',
      'Optimal Dual-Band Wi-Fi Coverage Calibration',
      'Zero Buffer Video Conferencing & 4K Streaming',
      'No Speed Drops during Peak Evening Hours'
    ],
    targetAudience: ['Homes', 'Work-from-Home Professionals', 'Small Offices'],
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'srv-ob-2',
    brandId: 'one-broadband',
    title: 'Enterprise Leased Line & Dedicated Bandwidth',
    slug: 'enterprise-leased-line',
    shortDescription: '1:1 symmetrical uncontended bandwidth with 99.9% uptime SLA and round-the-clock proactive network monitoring.',
    fullDescription: 'For businesses that cannot afford a second of downtime. We deliver dedicated, uncontended internet leased circuits over redundant fiber rings, backed by stringent Service Level Agreements (SLA), multiple static IP addresses, and direct BGP routing.',
    iconName: 'Network',
    features: [
      '1:1 Dedicated Symmetrical Bandwidth (Unshared)',
      '99.9% Network Uptime Guarantee with SLA Rebates',
      'Multiple Usable Static IPv4 / IPv6 Addresses',
      'Dual-Path Ring Redundancy for Failover Protection',
      'Dedicated 24/7 Enterprise Network Operations Center'
    ],
    targetAudience: ['Corporates', 'Data Centers', 'Financial Institutions', 'BPOs'],
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'srv-ob-3',
    brandId: 'one-broadband',
    title: 'Structured LAN & Whole-Campus Wi-Fi Solutions',
    slug: 'structured-lan-campus-wifi',
    shortDescription: 'End-to-end office networking, managed switches, server rack integration, and seamless roaming Wi-Fi access points.',
    fullDescription: 'Eliminate dead zones and network bottlenecks. We design and implement clean structured CAT6/fiber cabling, managed PoE distribution racks, and enterprise cloud-managed wireless access points providing seamless client roaming across multi-story buildings.',
    iconName: 'Server',
    features: [
      'Certified CAT6/CAT6A Structured Patch Cabling',
      'Seamless Roaming Multi-AP Wireless Controller Setup',
      'VLAN Segmentation for Guest, Staff & Security Networks',
      'Clean Server Rack Dressing & Cable Labeling',
      'Bandwidth Management & Firewall Security Rules'
    ],
    targetAudience: ['Offices', 'Hotels & Resorts', 'Educational Institutes', 'Retail Hubs'],
    featured: false,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // A.M. Distributors Chiplun Services
  {
    id: 'srv-am-1',
    brandId: 'am-distributors',
    title: 'Bulk Packaged Mineral Water & Institutional Supply',
    slug: 'bulk-packaged-mineral-water-distribution',
    shortDescription: 'Reliable route distribution of 20L sanitized bubble top jars, 500ml & 1L bottled water to commercial, retail, and event partners.',
    fullDescription: 'A.M. Distributors operates dedicated daily delivery routes across Chiplun and surrounding Konkan areas. We supply certified ISI packaged mineral water in tamper-evident sealed packaging to retail grocers, hospitality establishments, corporate canteens, and construction worksites with scheduled refill frequency.',
    iconName: 'Building2',
    features: [
      'Scheduled 20L Bubble Top Jar Route Delivery',
      'Carton & Case Supply for 500ml & 1L Bottles',
      'Dispenser Stand & Tap Hardware Support',
      'Guaranteed Batch Purity & Tamper-Proof Seals',
      'Flexible Credit & Invoicing for Bulk Institutional Clients'
    ],
    targetAudience: ['Retail Grocers', 'Hotels & Restaurants', 'Offices & Banks', 'Event Venues'],
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'srv-am-2',
    brandId: 'am-distributors',
    title: 'Cold-Chain Dairy & Commercial Ice Cream Logistics',
    slug: 'cold-chain-dairy-ice-cream-logistics',
    shortDescription: 'Temperature-monitored refrigerated transit and 4:00 AM dispatch ensuring uninterrupted fresh dairy and -18°C ice cream supply.',
    fullDescription: 'Preserving freshness through strict cold-chain compliance. A.M. Distributors manages temperature-controlled delivery vehicles and insulated transport for daily fresh milk pouches, butter crates, dairy products, and commercial ice cream tubs, ensuring zero thermal abuse from central depot to neighborhood retail freezers.',
    iconName: 'Server',
    features: [
      'Daily 4:00 AM Morning Route Dispatch',
      '-18°C Deep Freeze Transit for Commercial Ice Creams',
      'Chilled Storage Compliance for Milk, Butter & Paneer',
      'Deep Freezer Maintenance & Replacement Assistance',
      'Real-Time Route Tracking & Delivery Confirmation'
    ],
    targetAudience: ['Supermarkets & Kiranas', 'Ice Cream Parlors', 'Bakeries & Sweet Marts', 'Hospitality Hubs'],
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    brandId: 'nexalus',
    title: 'Apex Tech Park — Integrated Campus Infrastructure',
    slug: 'apex-tech-park-infrastructure',
    clientType: 'Enterprise',
    location: 'Electronic City, Bengaluru',
    description: 'Turnkey deployment of redundant 1 Gbps fiber leased connectivity paired with an enterprise 128-camera CP PLUS 4K surveillance grid across 4 interconnected office towers.',
    solutionProvided: 'Nexalus engineered a dual-ring fiber backbone, deployed 24-port PoE switching arrays, and installed AI-enabled perimeter dome and bullet cameras tied into a central security command center.',
    scope: [
      '128 × CP PLUS 4MP & 4K AI Cameras',
      'Redundant 1 Gbps Symmetrical Leased Line by One Broadband',
      '4 × 32-Channel Enterprise NVRs with 80TB RAID Storage',
      'Whole-Campus Managed Wi-Fi with 45 Cloud APs',
      'Central Operations Video Wall Setup'
    ],
    images: [
      '/images/projects/tech-park.jpg'
    ],
    featured: true,
    published: true,
    completionDate: '2025-11-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'proj-2',
    brandId: 'nexalus',
    title: 'Ratnagiri Waterfront Resort & Commercial Security Grid',
    slug: 'ratnagiri-waterfront-resort-security',
    clientType: 'Commercial',
    location: 'Mirjole Coastal Strip, Ratnagiri, Maharashtra',
    description: 'Full perimeter defense and gigabit optical fiber deployment across an 18-acre waterfront resort with 4K Starlight color night-vision cameras and central security NOC.',
    solutionProvided: 'Installed marine-grade IP67 vandal-proof dome cameras along high-corrosion beach zones and wired high-speed fiber backhauls with uninterrupted guest Wi-Fi roaming.',
    scope: [
      '48 × CP PLUS 4K Starlight Color Night-Vision Domes',
      'Dedicated Symmetrical Optical Fiber Leased Line',
      'Whole-Property Wi-Fi 6 Mesh Roaming',
      'Gate ANPR Vehicle Tracking & Visitor Intercom'
    ],
    images: [
      '/images/cctv-real-2.jpg'
    ],
    featured: true,
    published: true,
    completionDate: '2026-01-20',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'proj-3',
    brandId: 'am-distributors',
    title: 'A.M. Distributors Chiplun Cold-Chain & Regional Depot Hub',
    slug: 'am-distributors-chiplun-depot-hub',
    clientType: 'Logistics',
    location: 'Kherdi MIDC, Chiplun 415605, Maharashtra',
    description: 'Establishment of state-of-the-art temperature-controlled cold-room storage and a dedicated refrigerated fleet delivering packaged mineral water, bulk ice cream, and dairy.',
    solutionProvided: 'Built zero-break cold-chain corridors with GPS temperature logging vehicles, 20L bottle automated sanitation docks, and daily 4:00 AM dispatch routes across Konkan.',
    scope: [
      '20L Mineral Water Automated Dispatch Dock (3,000 Jars/Day)',
      'Refrigerated Fleet Supporting -18°C Ice Cream Logistics',
      '4:00 AM Doorstep Milk Pouch & Pure Butter Supply Route',
      'FSSAI Certified Cold Storage Warehouse Operations'
    ],
    images: [
      '/images/am-warehouse-depot.jpg'
    ],
    featured: true,
    published: true,
    completionDate: '2025-10-01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'proj-4',
    brandId: 'nexalus',
    title: 'Sangli-Kolhapur Industrial Corridor Manufacturing Plant',
    slug: 'sangli-kolhapur-industrial-manufacturing',
    clientType: 'Industrial',
    location: 'Kupwad MIDC, Sangli, Maharashtra',
    description: 'Heavy industrial facility deployment with 45,000 sq.ft. structured Cat6A pure copper cabling, 10G optical uplinks, and AI motion tracking PTZ cameras.',
    solutionProvided: 'Nexalus engineered an industrial switch fabric with hardware firewalls, organized 42U server cabinets, and centralized monitoring with remote live view.',
    scope: [
      '32 × CP PLUS High-Bay PTZ Domes with Auto-Tracking',
      'Organized 42U Server Cabinets & 10G SFP+ Uplinks',
      'Fluke-Certified Pure Copper Cat6A Structured Cabling',
      '40TB RAID NVR Storage with 90-Day Archival SLA'
    ],
    images: [
      '/images/computer-rack-switches-real.jpg'
    ],
    featured: true,
    published: true,
    completionDate: '2026-02-18',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'proj-5',
    brandId: 'am-distributors',
    title: 'Konkan Institutional & Supermarket Dairy Logistics Fleet',
    slug: 'konkan-supermarket-dairy-fleet',
    clientType: 'Wholesale',
    location: 'Chiplun, Khed & Guhagar Route, Maharashtra',
    description: 'Wholesale cold-chain distribution network supplying commercial bulk ice cream tubs, bottled mineral water cases, and dairy products to supermarkets and hotels.',
    solutionProvided: 'Structured daily morning supply SLAs with dedicated refrigerated vans ensuring zero melting and guaranteed doorstep delivery before 7:00 AM.',
    scope: [
      'Bulk Ice Cream Supply to 120+ Retailers (Amul / Vadilal)',
      'Bottled Mineral Water Cases (500ml & 1L) Wholesale',
      'Dairy & Pure Ghee Institutional Catering Tins',
      'Daily 4:00 AM Dispatch Guarantee'
    ],
    images: [
      '/images/projects/logistics-center.jpg'
    ],
    featured: true,
    published: true,
    completionDate: '2026-03-05',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'proj-6',
    brandId: 'cp-plus',
    title: 'Grand Horizon Luxury Residency Surveillance Upgrade',
    slug: 'grand-horizon-surveillance',
    clientType: 'Residential',
    location: 'Indiranagar & Electronic City Corridor',
    description: 'Modernization of perimeter, parking basement, and lobby security for an upscale 240-unit residential gated community.',
    solutionProvided: 'Replaced legacy analog cameras with 64 CP PLUS Starlight full-color IP cameras and established ANPR barrier gate tracking for resident and visitor vehicles.',
    scope: [
      '64 × CP PLUS Full-Color Night Vision IP Cameras',
      'ANPR Vehicle License Plate Automatic Barrier Sync',
      'High-Speed Basement Wi-Fi Backhaul by One Broadband',
      'Resident Security Guard Intercom & Control Station'
    ],
    images: [
      '/images/projects/luxury-residency.jpg'
    ],
    featured: true,
    published: true,
    completionDate: '2026-02-10',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialServiceAreas: ServiceArea[] = [
  {
    id: 'sa-chiplun',
    brandId: 'am-distributors',
    locality: 'Kherdi MIDC, Chiplun Central & Bazaar Road',
    city: 'Chiplun',
    state: 'Maharashtra',
    pincode: '415605',
    status: 'fully_operational',
    services: [
      '20-Litre Packaged Mineral Water Jars',
      'Bottled Drinking Water Cases (500ml/1L)',
      'Commercial Bulk Ice Cream Tubs (Amul / Vadilal)',
      'Daily Farm-Fresh Milk Pouches & Dairy',
      'Cold-Chain Refrigerated Logistics Fleet',
      'Chiplun Depot Wholesale Booking'
    ],
    notes: 'Central Depot Hub — Daily 4:00 AM morning route dispatch across Chiplun & surrounding MIDC',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sa-ratnagiri',
    brandId: 'all',
    locality: 'Mirjole MIDC, Port Road, Coastal Strip & City Center',
    city: 'Ratnagiri',
    state: 'Maharashtra',
    pincode: '415612',
    status: 'fully_operational',
    services: [
      'Commercial 4K CCTV Video Surveillance',
      'High-Speed Optical Fiber Internet',
      'Enterprise Switching & Managed Wi-Fi',
      'Cold-Chain Logistics Supply',
      '20L Mineral Water Delivery',
      'Same-Day Onsite Technical Survey'
    ],
    notes: 'Full active regional coverage with local technicians and refrigerated depot supply lines',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sa-sangli',
    brandId: 'nexalus',
    locality: 'Kupwad MIDC, Vishrambag, Market Yard & City Core',
    city: 'Sangli',
    state: 'Maharashtra',
    pincode: '416416',
    status: 'fully_operational',
    services: [
      'Commercial 4K CCTV Surveillance Systems',
      'Symmetrical Gigabit Optical Fiber Leased Line',
      'Enterprise IT Racks & PoE+ Switching',
      'Fluke-Certified Pure Copper Cat6A Cabling',
      'CCTV AMC & Field Maintenance SLA'
    ],
    notes: 'Dedicated on-site technician team in Sangli with 45-minute emergency restoration SLA',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sa-kolhapur',
    brandId: 'nexalus',
    locality: 'Shiroli MIDC, Gokul Shirgaon Industrial & Tarabai Park',
    city: 'Kolhapur',
    state: 'Maharashtra',
    pincode: '416001',
    status: 'fully_operational',
    services: [
      'Commercial 4K CCTV Video Surveillance',
      'Gigabit Optical Fiber FTTH Broadband',
      'Managed Wi-Fi 6 Routers & Whole-Premises Mesh',
      'Pure Copper Cat6A Structured Office Cabling',
      'Hardware Firewall Installation'
    ],
    notes: 'Direct authorized OEM integrations with authentic serial number warranties',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sa-pune',
    brandId: 'nexalus',
    locality: 'Hinjewadi IT Park, Shivajinagar, Baner & Hadapsar',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    status: 'fully_operational',
    services: [
      'Enterprise Layer-2/3 Managed PoE+ Switching',
      'Security Command Center 4K Video Wall Integration',
      '10G SFP+ Optical Leased Line Backhaul',
      '24/7 Operations NOC SLA Monitoring',
      'Door Access Terminals & Smart Intercoms'
    ],
    notes: 'Corporate infrastructure consulting with certified network & security engineers',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sa-mumbai',
    brandId: 'nexalus',
    locality: 'BKC, Andheri East Industrial & Navi Mumbai MIDC',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    status: 'fully_operational',
    services: [
      'Turnkey Commercial CCTV Surveillance Grids',
      'Enterprise Structured Cabling Cat6A & Fiber',
      'Dedicated Symmetrical Business Leased Line',
      'High-Bay Warehouse Camera Installations'
    ],
    notes: 'Enterprise project delivery with Fluke-certified testing and multi-node switch fabrics',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sa-khed',
    brandId: 'am-distributors',
    locality: 'Khed Bazaar, MIDC Zone & Guhagar Coastal Road',
    city: 'Khed',
    state: 'Maharashtra',
    pincode: '415703',
    status: 'fully_operational',
    services: [
      '20-Litre Packaged Mineral Water Jars',
      'Commercial Ice Cream Wholesale (Amul / Vadilal)',
      'Daily 4:00 AM Farm-Fresh Milk Pouches',
      'Doorstep Delivery SLA for Retailers & Resorts'
    ],
    notes: 'Daily scheduled refrigerated van runs departing from Chiplun depot at 4:00 AM',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sa-satara',
    brandId: 'nexalus',
    locality: 'Karad MIDC, Satara City Center & Highway Corridor',
    city: 'Satara',
    state: 'Maharashtra',
    pincode: '415001',
    status: 'expanding_soon',
    services: [
      'Commercial 4K CCTV Video Surveillance',
      'High-Speed Optical Fiber Internet',
      'Office Networking & Managed Switches',
      'Advance Project Site Surveys'
    ],
    notes: 'Currently accepting advance site survey bookings; weekly dedicated installation slots',
    updatedAt: new Date().toISOString()
  }
];

export const initialFaqs: FAQ[] = [
  // Nexalus Parent FAQs
  {
    id: 'faq-1',
    brandId: 'nexalus',
    category: 'General',
    question: 'What is the relationship between Nexalus Innovations LLP, CP PLUS, and One Broadband?',
    answer: 'Nexalus Innovations LLP is the parent technology and infrastructure company. We operate and deliver two dedicated business divisions: CP PLUS (providing authorized surveillance, CCTV equipment, and security installations) and One Broadband (delivering high-speed fiber internet and enterprise networking). This unified structure allows clients to access both critical services through a single, accountable corporate partner.',
    order: 1,
    published: true
  },
  {
    id: 'faq-2',
    brandId: 'nexalus',
    category: 'Solutions',
    question: 'Can I get a combined package for both internet connectivity and CCTV surveillance?',
    answer: 'Yes! Our Integrated Infrastructure packages are specifically designed for businesses, apartment societies, and modern homes that need high-speed internet and security surveillance installed simultaneously. Combining both minimizes cabling disruption and provides a consolidated billing and support contract.',
    order: 2,
    published: true
  },
  // CP PLUS FAQs
  {
    id: 'faq-3',
    brandId: 'cp-plus',
    category: 'Surveillance',
    question: 'Can I monitor my CP PLUS CCTV cameras remotely on my smartphone?',
    answer: 'Absolutely. All our modern CP PLUS IP cameras and DVR/NVR setups are configured with the secure CP PLUS mobile app (iOS and Android). You can view live streams, review historical recordings, receive push notifications on motion detection, and capture snapshots from anywhere with an active internet connection.',
    order: 3,
    published: true
  },
  {
    id: 'faq-4',
    brandId: 'cp-plus',
    category: 'Installation & Warranty',
    question: 'What warranty and after-sales support do you provide on CCTV systems?',
    answer: 'All CP PLUS hardware carries official manufacturer warranties (typically 1 to 2 years depending on the model). In addition, Nexalus Innovations LLP provides professional installation warranties and flexible Annual Maintenance Contracts (AMC) with dedicated engineer response times.',
    order: 4,
    published: true
  },
  // One Broadband FAQs
  {
    id: 'faq-5',
    brandId: 'one-broadband',
    category: 'Broadband',
    question: 'How fast is One Broadband installation once I place a connection request?',
    answer: 'In our fully operational service areas, standard residential connection installation takes between 24 and 48 hours following application verification. For enterprise leased line circuits requiring custom fiber trenching, timelines are tailored to site specifications.',
    order: 5,
    published: true
  },
  {
    id: 'faq-6',
    brandId: 'one-broadband',
    category: 'Plans & Speeds',
    question: 'Are One Broadband upload and download speeds symmetrical?',
    answer: 'Yes, our 100% optical fiber (FTTH) network delivers symmetrical speeds, meaning your upload speed matches your download speed. This is crucial for smooth video conferencing, cloud file backups, online streaming, and enterprise server syncing.',
    order: 6,
    published: true
  }
];

export const initialBanners: SiteBanner[] = [
  {
    id: 'ban-parent',
    brandId: 'nexalus',
    title: 'Connecting Businesses. Protecting What Matters.',
    subtitle: 'Nexalus Innovations LLP delivers connectivity, security and networking solutions designed for homes, businesses and modern enterprises.',
    badge: 'Enterprise Networking & Multi-Company Solutions',
    ctaText: 'Explore Our Solutions',
    ctaLink: '/services',
    secondaryCtaText: 'Request Quotation',
    secondaryCtaLink: '/quote',
    active: true,
    imageUrl: '/images/hero-server.jpg',
    supportPhone: '+91 98765 43210',
    supportEmail: 'contact@nexalusinnovations.com',
    officeAddress: 'Chiplun Central Office, Maharashtra 415605',
    workingHours: 'Mon - Sat: 9:00 AM - 7:00 PM',
    showHero: true,
    showTeam: true,
    showFaqs: true,
    showContact: true
  },
  {
    id: 'ban-innovations',
    brandId: 'nexalus-innovations',
    title: 'Nexalus Innovations',
    subtitle: 'The specialized engineering division of Nexalus Innovations LLP. We architect and deploy certified 4K CCTV surveillance grids, high-speed optical fiber connectivity, and managed enterprise networking across Maharashtra.',
    badge: 'Optical Fiber Broadband & CCTV Surveillance',
    ctaText: 'View Tech Products & Plans',
    ctaLink: '/brands/nexalus-innovations/products',
    secondaryCtaText: 'View Fiber Tariffs',
    secondaryCtaLink: '/plans',
    active: true,
    imageUrl: '/images/simple-cctv-camera.jpg',
    supportPhone: '+91 98765 43211',
    supportEmail: 'support@nexalusinnovations.com',
    officeAddress: 'Tech Engineering Depot, Chiplun 415605',
    workingHours: 'Mon - Sun: 8:00 AM - 8:00 PM',
    showHero: true,
    showTeam: true,
    showFaqs: true,
    showContact: true
  },
  {
    id: 'ban-am',
    brandId: 'am-distributors',
    title: 'A.M. Distributors Chiplun',
    subtitle: 'The dedicated regional cold-chain and commercial distribution hub for Chiplun and the Konkan region. Operating under Nexalus Innovations LLP, we manage temperature-controlled refrigerated logistics for packaged mineral water, commercial ice creams, farm-fresh milk, butter, and complete dairy supplies.',
    badge: 'Konkan Cold-Chain & Wholesale Distribution',
    ctaText: 'Order Wholesale Supply',
    ctaLink: '/brands/am-distributors/products',
    secondaryCtaText: 'Route Logistics',
    secondaryCtaLink: '/brands/am-distributors/services',
    active: true,
    imageUrl: '/images/products/amul-milk.jpg',
    supportPhone: '+91 98765 43212',
    supportEmail: 'depot@amdistributors.com',
    officeAddress: 'A.M. Distributors Depot, Chiplun Industrial Zone 415605',
    workingHours: 'Daily Route Dispatch: 4:00 AM - 8:00 PM',
    showHero: true,
    showTeam: true,
    showFaqs: true,
    showContact: true
  }
];

export const initialUsers: AdminUser[] = [
  {
    uid: 'admin-parent-01',
    displayName: 'Nexalus Corporate Master Admin',
    email: 'admin@nexalus.com',
    role: 'super_admin',
    assignedBrandId: 'all',
    active: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  },
  {
    uid: 'admin-parent-02',
    displayName: 'Nexalus Corporate Master Admin',
    email: 'admin@nexalusinnovations.com',
    role: 'super_admin',
    assignedBrandId: 'all',
    active: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  },
  {
    uid: 'admin-innovations-01',
    displayName: 'Nexalus Innovations Tech Manager (CCTV, Internet, Network)',
    email: 'innovations@nexalus.com',
    role: 'innovations_admin',
    assignedBrandId: 'nexalus-innovations',
    active: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  },
  {
    uid: 'admin-innovations-02',
    displayName: 'Nexalus Innovations Tech Manager (CCTV, Internet, Network)',
    email: 'innovations.admin@nexalusinnovations.com',
    role: 'innovations_admin',
    assignedBrandId: 'nexalus-innovations',
    active: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  },
  {
    uid: 'admin-innovations-03',
    displayName: 'Nexalus Innovations Admin',
    email: 'admin@innovations.com',
    role: 'innovations_admin',
    assignedBrandId: 'nexalus-innovations',
    active: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  },
  {
    uid: 'admin-am-01',
    displayName: 'A.M. Distributors Chiplun Depot Manager',
    email: 'am@nexalus.com',
    role: 'am_admin',
    assignedBrandId: 'am-distributors',
    active: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  },
  {
    uid: 'admin-am-02',
    displayName: 'A.M. Distributors Chiplun Depot Manager',
    email: 'am.admin@nexalusinnovations.com',
    role: 'am_admin',
    assignedBrandId: 'am-distributors',
    active: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  },
  {
    uid: 'admin-am-03',
    displayName: 'A.M. Distributors Admin',
    email: 'admin@amdistributors.com',
    role: 'am_admin',
    assignedBrandId: 'am-distributors',
    active: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  },
  {
    uid: 'admin-am-04',
    displayName: 'A.M. Distributors Admin',
    email: 'admin@am.com',
    role: 'am_admin',
    assignedBrandId: 'am-distributors',
    active: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  }
];

export const initialEnquiries: Enquiry[] = [
  {
    id: 'enq-101',
    customerName: 'Vikramaditya Sharma',
    phone: '+91 98450 11223',
    email: 'vikram.sharma@techhorizon.in',
    brandId: 'nexalus-innovations',
    enquiryType: 'quote',
    productOrServiceName: '4K Commercial AI CCTV Surveillance Grid + 16CH NVR',
    location: 'Koramangala 4th Block, Bengaluru',
    pincode: '560034',
    message: 'We require a 12-camera CCTV upgrade for our software engineering office premises. Need quotation including installation and warranty.',
    status: 'in_progress',
    assignedTo: 'innovations.admin@nexalusinnovations.com',
    internalNotes: 'Initial site visit completed on Monday. Sent preliminary quotation. Awaiting confirmation from facility manager.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'enq-102',
    customerName: 'Ananya Deshmukh',
    phone: '+91 99801 44556',
    email: 'ananya.deshmukh@gmail.com',
    brandId: 'nexalus-innovations',
    enquiryType: 'coverage',
    productOrServiceName: 'High-Speed 300 Mbps Optical Fiber Internet Plan',
    location: 'Indiranagar 100ft Road, Bengaluru',
    pincode: '560038',
    message: 'Checking if high-speed optical fiber internet is available at 12th Main Indiranagar. Looking to switch from existing copper connection.',
    status: 'contacted',
    assignedTo: 'innovations.admin@nexalusinnovations.com',
    internalNotes: 'Area verified active under node IND-04. Sent customer plan options. Technician visit scheduled for tomorrow morning.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'enq-103',
    customerName: 'Sanjay Sawant',
    phone: '+91 94223 88112',
    email: 'sanjay.sawant@chiplunresorts.com',
    brandId: 'am-distributors',
    enquiryType: 'quote',
    productOrServiceName: '20L Packaged Mineral Water Bulk Supply (60 Cans/Week)',
    location: 'Bahadursheikh Naka, Chiplun',
    pincode: '415605',
    message: 'We require commercial daily delivery of 20L ISI certified chilled mineral water cans for our hotel and restaurant in Chiplun.',
    status: 'new',
    assignedTo: 'am.admin@nexalusinnovations.com',
    internalNotes: 'New hotel client contract inquiry. Route truck Chiplun-02 scheduled for quotation visit.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'enq-104',
    customerName: 'Manoj Kadam',
    phone: '+91 98221 44550',
    email: 'kadam.dairy@gmail.com',
    brandId: 'am-distributors',
    enquiryType: 'service',
    productOrServiceName: 'Commercial Ice Cream Bulk Tubs & Cold Storage Supply',
    location: 'Mumbai-Goa Highway Market, Chiplun',
    pincode: '415605',
    message: 'Looking for distributor partner for commercial 4L ice cream tubs and dairy cold-chain supply for upcoming festive banquet orders.',
    status: 'in_progress',
    assignedTo: 'am.admin@nexalusinnovations.com',
    internalNotes: 'Provided dealer price list for ice cream varieties and morning delivery logistics.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

export const initialSeoSettings: SeoSettings = {
  siteTitle: 'Nexalus Innovations LLP — Technology & Cold-Chain Distribution Solutions',
  siteDescription: 'Nexalus Innovations LLP governs two premier operating companies: Nexalus Innovations (CCTV Surveillance, High-Speed Optical Fiber Internet & Enterprise Networking) and A.M. Distributors Chiplun (Packaged Mineral Water, Commercial Ice Cream & Dairy Logistics Hub).',
  keywords: 'Nexalus Innovations LLP, Nexalus Innovations, A.M. Distributors Chiplun, commercial CCTV surveillance, gigabit optical fiber, enterprise networking, packaged mineral water, commercial ice cream Chiplun, fresh milk dairy distribution Maharashtra',
  contactEmail: 'contact@nexalusinnovations.com',
  contactPhone: '+91 9158886444 / +91 9822334455',
  address: 'Nexalus Innovations LLP, Corporate Operations, Maharashtra, India',
  socials: {
    linkedin: 'https://linkedin.com/company/nexalus-innovations-llp',
    twitter: 'https://twitter.com/nexalusinnovations',
    facebook: 'https://facebook.com/nexalusinnovations',
    instagram: 'https://instagram.com/nexalusinnovations'
  }
};

export const initialTeamMembers: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Pranav More',
    role: 'Managing Partner & Director',
    department: 'Corporate Leadership',
    deptType: 'leadership',
    division: 'all',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    specialty: 'Enterprise Strategy & Governance',
    tag: 'Executive Lead',
    circleBorder: 'border-amber-400',
    circleShadow: 'shadow-[0_10px_30px_rgba(245,158,11,0.45)]',
    circleHoverShadow: 'group-hover:shadow-[0_16px_40px_rgba(245,158,11,0.7)] group-hover:border-amber-500',
    badgeBg: 'bg-amber-500',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'team-2',
    name: 'Aniket Shinde',
    role: 'Lead Network Architect',
    department: 'Optical Fiber & Telecom',
    deptType: 'tech',
    division: 'nexalus-innovations',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    specialty: 'FTTH Gigabit Backhaul & Switching',
    tag: 'Fiber Architect',
    circleBorder: 'border-blue-500',
    circleShadow: 'shadow-[0_10px_30px_rgba(59,130,246,0.45)]',
    circleHoverShadow: 'group-hover:shadow-[0_16px_40px_rgba(59,130,246,0.7)] group-hover:border-blue-400',
    badgeBg: 'bg-blue-600',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'team-3',
    name: 'Pooja Deshmukh',
    role: 'Head of Electronic Security',
    department: 'CCTV Surveillance & IoT',
    deptType: 'tech',
    division: 'nexalus-innovations',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    specialty: '4K Commercial Cameras & Control',
    tag: 'Security Lead',
    circleBorder: 'border-cyan-400',
    circleShadow: 'shadow-[0_10px_30px_rgba(6,182,212,0.45)]',
    circleHoverShadow: 'group-hover:shadow-[0_16px_40px_rgba(6,182,212,0.7)] group-hover:border-cyan-300',
    badgeBg: 'bg-cyan-600',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'team-4',
    name: 'Rahul Kadam',
    role: 'Cold-Chain Operations Head',
    department: 'A.M. Distributors Chiplun',
    deptType: 'logistics',
    division: 'am-distributors',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    specialty: 'Refrigerated Fleet & Chiplun Depot',
    tag: 'Logistics Head',
    circleBorder: 'border-teal-400',
    circleShadow: 'shadow-[0_10px_30px_rgba(20,184,166,0.45)]',
    circleHoverShadow: 'group-hover:shadow-[0_16px_40px_rgba(20,184,166,0.7)] group-hover:border-teal-300',
    badgeBg: 'bg-teal-600',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'team-5',
    name: 'Snehal Patil',
    role: 'Enterprise Systems Engineer',
    department: 'IT Networking & Hardware',
    deptType: 'tech',
    division: 'nexalus-innovations',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    specialty: 'Managed PoE+ & Fluke Cat6A Cabling',
    tag: 'Systems Engineer',
    circleBorder: 'border-indigo-500',
    circleShadow: 'shadow-[0_10px_30px_rgba(99,102,241,0.45)]',
    circleHoverShadow: 'group-hover:shadow-[0_16px_40px_rgba(99,102,241,0.7)] group-hover:border-indigo-400',
    badgeBg: 'bg-indigo-600',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'team-6',
    name: 'Sachin Pawar',
    role: 'QA & Compliance Lead',
    department: 'A.M. Distributors Chiplun',
    deptType: 'logistics',
    division: 'am-distributors',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    specialty: 'FSSAI Depot Compliance & Sanitization',
    tag: 'QA & Compliance',
    circleBorder: 'border-emerald-500',
    circleShadow: 'shadow-[0_10px_30px_rgba(16,185,129,0.45)]',
    circleHoverShadow: 'group-hover:shadow-[0_16px_40px_rgba(16,185,129,0.7)] group-hover:border-emerald-400',
    badgeBg: 'bg-emerald-600',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'team-7',
    name: 'Tanvi Joshi',
    role: '24/7 NOC Support Lead',
    department: 'Technical Support Desk',
    deptType: 'tech',
    division: 'nexalus-innovations',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80',
    specialty: 'Guaranteed SLA Uptime & Response',
    tag: 'NOC Lead',
    circleBorder: 'border-sky-400',
    circleShadow: 'shadow-[0_10px_30px_rgba(56,189,248,0.45)]',
    circleHoverShadow: 'group-hover:shadow-[0_16px_40px_rgba(56,189,248,0.7)] group-hover:border-sky-300',
    badgeBg: 'bg-sky-600',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'team-8',
    name: 'Vikram Salunkhe',
    role: 'Senior Telecom & Splicing Lead',
    department: 'Field Engineering & Maintenance',
    deptType: 'tech',
    division: 'nexalus-innovations',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    specialty: 'Fusion Splicing & Optical Link Testing',
    tag: 'Telecom Specialist',
    circleBorder: 'border-blue-400',
    circleShadow: 'shadow-[0_10px_30px_rgba(96,165,250,0.45)]',
    circleHoverShadow: 'group-hover:shadow-[0_16px_40px_rgba(96,165,250,0.7)] group-hover:border-blue-300',
    badgeBg: 'bg-blue-600',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
