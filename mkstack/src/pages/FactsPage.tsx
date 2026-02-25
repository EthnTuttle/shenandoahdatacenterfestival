import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ExternalLink,
  Zap,
  Droplets,
  Volume2,
  Truck,
  DollarSign,
  AlertTriangle,
  TreePine,
  Users,
  TrendingDown,
  Building2,
  Clock,
} from 'lucide-react';

interface StatItem {
  number: string;
  label: string;
  highlight?: boolean;
}

interface FactSection {
  icon: React.ReactNode;
  title: string;
  items: string[];
  callout?: string;
}

const stats: StatItem[] = [
  { number: '15,000+', label: 'Acres of prime farmland potentially affected', highlight: true },
  { number: '200+', label: 'Family farms operating in Frederick County', highlight: true },
  { number: '2–4%', label: 'Of U.S. electricity consumed by datacenters nationally' },
  { number: '$7.8B', label: "Annual economic impact of Virginia's agriculture & forestry" },
  { number: '1–3M', label: 'Gallons of water consumed per large datacenter, per day', highlight: true },
  { number: '60–70 dB', label: 'Continuous noise from datacenter operations (= highway traffic)', highlight: true },
  { number: '52×/yr', label: 'Generator test events — every Tuesday, 2–4 hours each' },
  { number: '$1.5–3B', label: 'Estimated 25-year cost to Frederick County taxpayers', highlight: true },
];

const sections: FactSection[] = [
  {
    icon: <TreePine className="w-6 h-6 text-green-600" />,
    title: 'Agricultural Heritage at Risk',
    items: [
      'Frederick County has been a cornerstone of Virginia\'s agricultural economy for over 250 years. The Shenandoah Valley\'s fertile soils support generations of family farms.',
      'Once converted to industrial use, prime farmland is effectively removed from agricultural production permanently — fragmenting rural communities and ecosystems.',
      'While datacenters bring some tax revenue, they employ far fewer people per acre than the agricultural enterprises they replace. A single family farm may employ 5–20 people year-round; a datacenter might employ 10–50 for hundreds of acres.',
      'The rural character that defines Frederick County — open spaces, scenic vistas, agricultural landscapes — faces irreversible change as industrial facilities alter the visual and environmental landscape.',
    ],
  },
  {
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    title: 'Energy & Power Consumption',
    items: [
      'A typical large datacenter consumes 50–100 megawatts of electricity — equivalent to the power needs of 40,000–80,000 homes.',
      'This massive energy demand strains local electrical infrastructure and increases reliance on fossil fuels.',
      'Construction of transmission lines crosses rural properties and permanently alters the scenic landscape that attracts residents and tourists to the region.',
      'Despite claims of carbon neutrality, construction and operation of datacenters generates significant emissions. Embodied carbon in concrete and steel represents decades of environmental impact.',
    ],
  },
  {
    icon: <Droplets className="w-6 h-6 text-blue-500" />,
    title: 'Water Infrastructure Crisis',
    items: [
      "Frederick County's water treatment infrastructure was designed for agricultural and residential use — not industrial-scale datacenter cooling.",
      'Current plants are already operating near capacity and require major upgrades. Plants built 30–40 years ago have no reserve capacity for industrial cooling systems.',
      'Datacenter cooling demands: 1–3 million gallons per day per large facility. Multiple datacenters create exponential demand increase competing with agricultural irrigation.',
      'Immediate upgrades needed: water treatment plant expansions ($50–100M), new transmission lines ($20–40M), distribution upgrades ($30–60M) — all funded through municipal bonds paid by residents.',
    ],
    callout: 'Frederick County taxpayers will subsidize billion-dollar tech companies\' water infrastructure while watching their agricultural heritage disappear.',
  },
  {
    icon: <Volume2 className="w-6 h-6 text-orange-500" />,
    title: 'Noise & Quality of Life',
    items: [
      'Datacenter cooling systems and generators operate 24/7/365, producing continuous low-frequency industrial noise that travels for miles in rural areas.',
      'Unlike urban environments where ambient noise masks industrial sounds, the quiet rural setting amplifies datacenter noise pollution.',
      'Every Tuesday morning, massive backup generators fire up for mandatory 2–4 hour testing at noise levels comparable to jet engines.',
      'The constant hum disrupts sleep patterns for residents within a 2-mile radius. Datacenter operations typically produce 60–70 dB continuously — in areas where normal ambient noise is 30–40 dB.',
    ],
  },
  {
    icon: <Truck className="w-6 h-6 text-gray-600" />,
    title: 'Traffic & Emergency Services',
    items: [
      "Frederick County's datacenter corridor relies on only two exits for massive construction traffic: Stephens City and Middletown — already at capacity during normal conditions.",
      '200–400 truck trips per day during peak construction. Concrete delivery trucks operating 24/7 during foundation pours. Oversized equipment requiring road closures.',
      'Emergency response times to rural properties already face 15–20 minute delays. Adding construction traffic could push times to 25–35 minutes — well beyond acceptable standards for cardiac emergencies, structure fires, or trauma cases.',
      'With multiple projects planned across Frederick County, residents face continuous construction disruption for the next decade.',
    ],
    callout: 'Life-threatening delays for medical emergencies and fire response — for 10+ years of continuous heavy construction traffic.',
  },
  {
    icon: <DollarSign className="w-6 h-6 text-red-500" />,
    title: 'The Hidden Tax Burden',
    items: [
      'Datacenters inflate property assessments county-wide, forcing farmers and small businesses to pay higher taxes on their newly "valuable" land — even though their income hasn\'t increased.',
      "Virginia's Composite Index of Local Ability to Pay (LCI) determines state funding. When datacenter development inflates property values, the state assumes Frederick County is \"wealthier\" and cuts funding — including school funding.",
      '50% of the LCI formula is based on property values. Higher assessed values → state cuts education aid → county must raise local taxes to compensate → residents pay more while schools get less.',
      'Agricultural families already struggling with commodity competition now face property tax increases they can\'t afford, accelerating farm closures and small business exodus.',
    ],
    callout: 'The school funding paradox: Datacenters were supposed to "solve" school funding — but they actually reduce state education aid and force higher local taxes.',
  },
  {
    icon: <Clock className="w-6 h-6 text-purple-500" />,
    title: 'The 25-Year Cost Reality',
    items: [
      'Years 1–10 (Construction): Infrastructure upgrades $200–400M, emergency services expansion $50–100M, road maintenance from heavy truck damage $20–40M, lost agricultural production $300–500M.',
      'Years 10–25 (Operation): Water system maintenance $100–200M, ongoing emergency service costs $150–300M, lost tourism/agritourism revenue $200–400M, property value impacts in rural areas $500M–$1B.',
      'Years 25+ (Decommissioning): Solar panel disposal and cleanup $100–200M, datacenter decommissioning if obsolete $300–600M, land restoration attempts $50–100M, legal costs and environmental liability: unknown.',
      'No restoration requirements: unlike mining operations, solar and datacenter developers face no legal obligation to restore agricultural capability. Land rezoned from agricultural to industrial rarely reverts.',
    ],
    callout: 'Frederick County residents may pay $1.5–3 billion over 25 years to subsidize the destruction of their agricultural heritage — with no guarantee of restoration and no plan for what remains.',
  },
];

const alternatives = [
  {
    icon: <Building2 className="w-5 h-5" />,
    title: 'Brownfield Development',
    desc: 'Prioritize datacenter development on previously industrial sites rather than converting prime agricultural land.',
  },
  {
    icon: <TreePine className="w-5 h-5" />,
    title: 'Agricultural Protection',
    desc: 'Strengthen agricultural zoning and conservation easements to preserve the county\'s most productive farmland.',
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Community Input',
    desc: 'Ensure meaningful public participation in land use decisions that affect the long-term character of Frederick County.',
  },
  {
    icon: <TrendingDown className="w-5 h-5" />,
    title: 'Diversified Economy',
    desc: 'Support economic development that builds on agricultural heritage — agritourism, food production, small manufacturing — rather than replacing it.',
  },
];

export function FactsPage() {
  useSeoMeta({
    title: 'Datacenter Facts - Shenandoah Datacenter Festival',
    description:
      'The real impact of datacenter development on Frederick County, Virginia: farmland loss, water consumption, noise, traffic, tax burden, and the 25-year cost to taxpayers.',
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Hero section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-red-100 text-red-700 border-red-200 text-sm px-4 py-1">
            Beyond the Satire
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            The Real Impact on Frederick County
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            The festival is satire. What's happening to Frederick County's farmland is not.
            Here's what the data actually shows about datacenter development in the Shenandoah Valley.
          </p>

          {/* Primary CTA */}
          <Card className="max-w-2xl mx-auto border-2 border-green-400 bg-green-50 shadow-md">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-left">
                  <h2 className="text-xl font-bold text-green-900 mb-1">Protect Frederick County</h2>
                  <p className="text-sm text-green-800">
                    The primary resource for residents fighting to preserve Frederick County's
                    agricultural heritage. News, meeting schedules, how to get involved.
                  </p>
                </div>
                <Button
                  asChild
                  className="bg-green-700 hover:bg-green-800 text-white whitespace-nowrap flex-shrink-0"
                  size="lg"
                >
                  <a
                    href="https://protectfrederick.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    Visit the Site
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            By the Numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`rounded-lg p-4 text-center border ${
                  stat.highlight
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`text-2xl font-bold mb-1 ${stat.highlight ? 'text-red-700' : 'text-gray-800'}`}>
                  {stat.number}
                </div>
                <div className="text-xs text-gray-600 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed fact sections */}
        <div className="space-y-8 mb-16">
          {sections.map((section, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  {section.icon}
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3 mb-4">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex gap-3 text-gray-700">
                      <span className="text-pink-500 font-bold mt-0.5 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {section.callout && (
                  <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4">
                    <p className="text-sm font-semibold text-amber-900">{section.callout}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alternatives */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Alternatives & Solutions</h2>
          <p className="text-gray-600 mb-6">
            The choice isn't between economic development and no development. There are better paths
            that don't destroy the agricultural heritage of Frederick County.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {alternatives.map((alt, i) => (
              <Card key={i} className="bg-green-50 border-green-200">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-3">
                    <div className="text-green-700 mt-0.5 flex-shrink-0">{alt.icon}</div>
                    <div>
                      <h3 className="font-semibold text-green-900 mb-1">{alt.title}</h3>
                      <p className="text-sm text-green-800">{alt.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Get Involved CTA section */}
        <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-xl p-8 text-white mb-12">
          <h2 className="text-2xl font-bold mb-3">Get Involved</h2>
          <p className="text-green-100 mb-6 max-w-2xl">
            The future of Frederick County depends on informed community participation in land use
            decisions. Every planning commission meeting, every supervisor contact, and every
            conversation with your neighbors matters.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              'Attend Frederick County Planning Commission meetings',
              'Contact your county supervisors about datacenter development policies',
              'Support local agricultural businesses and farmers\' markets',
              'Stay informed about proposed projects in your area',
            ].map((action, i) => (
              <div key={i} className="bg-white/10 rounded-lg p-3 text-sm text-green-100">
                {action}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-white text-green-800 hover:bg-green-50 font-semibold">
              <a
                href="https://protectfrederick.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                Protect Frederick County
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
              <a
                href="https://www.frederickcountyhomesteaders.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                Frederick County Homesteaders
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
              <a
                href="https://www.frederickcountyva.gov/1014/Planning-Commission"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                Planning Commission
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
              <a
                href="https://www.vafb.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                Virginia Farm Bureau
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Sources note */}
        <div className="text-sm text-gray-500 border-t border-gray-200 pt-6">
          <p>
            <strong>Sources & Disclaimer:</strong> This page compiles publicly available information
            and serves as a starting point for further research. For the most current data on specific
            projects and policies, consult official Frederick County government resources, local news
            outlets, and{' '}
            <a
              href="https://protectfrederick.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:underline"
            >
              protectfrederick.org
            </a>
            .
          </p>
        </div>
      </div>
    </Layout>
  );
}
