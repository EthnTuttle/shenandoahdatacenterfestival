import { useSeoMeta } from '@unhead/react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Calendar, Zap, ExternalLink } from 'lucide-react';

// Hero decay stages: blossom → dying → datacenter
const DECAY_STAGES = [
  {
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 50%, #f05d79 100%)',
    emoji: '🌸',
    label: 'cherry blossoms',
  },
  {
    gradient: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 50%, #c084fc 100%)',
    emoji: '🥀',
    label: 'dying flowers',
  },
  {
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #1e1b4b 50%, #312e81 100%)',
    emoji: '🖥️',
    label: 'datacenter',
  },
];

const STAGE_DURATION = 3500; // ms per stage

const events = [
  {
    title: 'Little Miss Gigawatt Pageant',
    time: '2:00 PM',
    description: 'Young contestants compete to represent peak power efficiency in our valley.',
  },
  {
    title: 'Solar Glare Staring Contest',
    time: '3:30 PM',
    description: 'Test your endurance against reflective server farm panels. Safety goggles provided — terms and conditions apply.',
  },
  {
    title: 'Streaming Parade of Protocols',
    time: '5:00 PM',
    description: 'Watch HTTP, TCP/IP, and friends march down what used to be Main Street.',
  },
  {
    title: 'Pick Your Server Speed Dating',
    time: '7:00 PM',
    description: 'Find your perfect match: RAID arrays, load balancers, and more. Sparks guaranteed.',
  },
  {
    title: 'Fiber Optic Cable Laying Ceremony',
    time: '9:00 AM',
    description: 'A solemn dedication of 40 miles of conduit across formerly productive farmland. Bring tissues.',
  },
  {
    title: 'Cooling Tower Misting Experience',
    time: '12:00 PM',
    description: 'Stand downwind of a 1M gallon/day cooling tower. Who needs the river anymore?',
  },
  {
    title: 'Digital Stag Lunch',
    time: '1:00 PM',
    description: 'Farm-to-server banquet celebrating the seamless transition from agriculture to megawatt consumption.',
  },
];

const recentDiscussions = [
  {
    title: 'Is liquid cooling worth it when the aquifer runs dry?',
    author: 'cooltech@datacenter.local',
    replies: 23,
    timestamp: '2h ago',
    tags: ['cooling', 'water'],
  },
  {
    title: 'The environmental impact of our digital celebrations',
    author: 'greentech@sustainable.org',
    replies: 17,
    timestamp: '4h ago',
    tags: ['environment', 'sustainability'],
  },
  {
    title: 'Generator testing every Tuesday — a love story',
    author: 'cableguru@organized.net',
    replies: 31,
    timestamp: '6h ago',
    tags: ['noise', 'neighbors'],
  },
];

export default function Index() {
  useSeoMeta({
    title: 'Shenandoah Datacenter Festival 2026',
    description:
      'Join us for the inaugural celebration of digital infrastructure, server farms, and the cloud computing revolution in beautiful Shenandoah Valley. A satirical look at Frederick County\'s agricultural future.',
  });

  const [stage, setStage] = useState(0);
  const stageRef = useRef(0);
  const eventsRef = useRef<HTMLDivElement>(null);

  // Hero decay animation: cycles through DECAY_STAGES
  useEffect(() => {
    const interval = setInterval(() => {
      stageRef.current = (stageRef.current + 1) % DECAY_STAGES.length;
      setStage(stageRef.current);
    }, STAGE_DURATION);
    return () => clearInterval(interval);
  }, []);

  const currentStage = DECAY_STAGES[stage];

  const scrollToEvents = () => {
    eventsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Layout>
      <div className="relative overflow-hidden">
        {/* Hero — decays from pink blossoms to datacenter purple */}
        <div
          className="text-white transition-decay"
          style={{ background: currentStage.gradient }}
        >
          <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 text-center">
            {/* Decay emoji overlay */}
            <div
              className="text-5xl mb-4 transition-decay select-none"
              aria-label={currentStage.label}
            >
              {currentStage.emoji}
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Shenandoah Datacenter Festival 2026
            </h1>
            <p className="text-xl md:text-2xl mb-2 opacity-90">
              Where Silicon Meets Silo
            </p>
            <p className="text-base md:text-lg mb-8 opacity-70 italic max-w-2xl mx-auto">
              Celebrating the quiet transformation of Frederick County's agricultural
              heritage into humming, water-guzzling, generator-testing digital infrastructure.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge
                variant="secondary"
                className="text-lg px-6 py-2 bg-white/20 text-white border-white/30"
              >
                <Calendar className="w-4 h-4 mr-2" />
                May 2–4, 2026
              </Badge>
              <Badge
                variant="secondary"
                className="text-lg px-6 py-2 bg-white/20 text-white border-white/30"
              >
                <Zap className="w-4 h-4 mr-2" />
                99.99% Uptime Guaranteed
              </Badge>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-pink-600 hover:bg-gray-50 font-semibold"
                asChild
              >
                <Link to="/discussions">Join Discussions</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={scrollToEvents}
              >
                View Schedule
              </Button>
            </div>
          </div>
        </div>

        {/* Satirical disclaimer banner */}
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 py-3 text-center">
            <p className="text-sm text-amber-800">
              <strong>This is satire.</strong> Behind the jokes lies a real fight to protect Frederick County's
              farmland.{' '}
              <a
                href="https://protectfrederick.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold hover:text-amber-900"
              >
                Learn what's really happening →
              </a>
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main column */}
            <div className="lg:col-span-2">
              <div ref={eventsRef} id="events">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Festival Highlights</h2>
                <p className="text-gray-500 mb-8 italic">
                  Three days of satirical celebration — while the valley is still here to celebrate.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((event, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg text-pink-700">{event.title}</CardTitle>
                      <div className="text-sm text-gray-500 font-medium">{event.time}</div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{event.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-12 bg-gradient-to-r from-gray-50 to-pink-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">About the Festival</h3>
                <p className="text-gray-700 mb-4">
                  The Shenandoah Datacenter Festival celebrates the <em>quiet heroes</em> of our digital
                  age: the humming server farms, the heroic cooling towers evaporating millions of
                  gallons of groundwater, and the miles of fiber optic cable laid lovingly across what
                  used to be some of Virginia's most productive farmland.
                </p>
                <p className="text-gray-700 mb-4">
                  Join us in the heart of the Shenandoah Valley — where rolling hills meet cutting-edge
                  infrastructure — for three days of satirical celebration, heated community discussion,
                  and a frank look at what "economic development" really means for 200+ family farms.
                </p>
                <div className="mt-6 p-4 bg-white rounded-lg border border-pink-200">
                  <p className="text-sm text-gray-600 font-medium">
                    Not laughing?{' '}
                    <a
                      href="https://protectfrederick.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-700 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      Visit Protect Frederick <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    to learn about the real impact on Frederick County's agricultural heritage.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {/* Live Discussions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900">
                      <MessageCircle className="w-5 h-5 mr-2 text-pink-600" />
                      Live Discussions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentDiscussions.map((discussion, index) => (
                        <div
                          key={index}
                          className="border-b border-gray-100 pb-4 last:border-b-0"
                        >
                          <Link
                            to="/discussions"
                            className="block hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                          >
                            <h4 className="text-sm font-medium text-gray-900 mb-1">
                              {discussion.title}
                            </h4>
                            <div className="flex items-center text-xs text-gray-500 mb-2">
                              <span className="truncate">{discussion.author}</span>
                              <span className="mx-1">•</span>
                              <span>{discussion.timestamp}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-1">
                                {discussion.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <Users className="w-3 h-3 mr-1" />
                                {discussion.replies}
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button asChild className="w-full" variant="outline">
                        <Link to="/discussions">View All Discussions</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Facts — satirical */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Festival Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected Attendees:</span>
                        <span className="font-medium">2,048</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Acres Converted:</span>
                        <span className="font-medium text-red-600">15,000+</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Water/Day (gal):</span>
                        <span className="font-medium text-red-600">3,000,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Generator Tests/Yr:</span>
                        <span className="font-medium">52</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Family Farms at Risk:</span>
                        <span className="font-medium text-red-600">200+</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button asChild className="w-full" variant="outline">
                        <Link to="/facts">See the Real Facts</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Protect Frederick CTA */}
                <Card className="mt-6 border-2 border-green-300 bg-green-50">
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-green-900 mb-2">Protect Frederick County</h3>
                    <p className="text-sm text-green-800 mb-4">
                      This site is satire — but the threat to Frederick County's farmland is real.
                      Learn how to get involved.
                    </p>
                    <Button
                      asChild
                      className="w-full bg-green-700 hover:bg-green-800 text-white"
                    >
                      <a
                        href="https://protectfrederick.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2"
                      >
                        Visit protectfrederick.org
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
