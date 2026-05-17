"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  TrendingUp, 
  Search, 
  Instagram, 
  ExternalLink, 
  RefreshCcw, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingDown,
  Globe,
  Tag,
  Monitor
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

// Mock Data
const trafficData = [
  { month: 'Jan', Fashcon: 45000, 'LuxuryDirect': 32000, 'ModaVibe': 28000 },
  { month: 'Feb', Fashcon: 52000, 'LuxuryDirect': 35000, 'ModaVibe': 30000 },
  { month: 'Mar', Fashcon: 48000, 'LuxuryDirect': 41000, 'ModaVibe': 35000 },
  { month: 'Apr', Fashcon: 61000, 'LuxuryDirect': 45000, 'ModaVibe': 38000 },
  { month: 'May', Fashcon: 55000, 'LuxuryDirect': 48000, 'ModaVibe': 42000 },
  { month: 'Jun', Fashcon: 67000, 'LuxuryDirect': 52000, 'ModaVibe': 45000 },
];

const trackedProducts = [
  { id: 1, name: "Prada Cleo Bag", ourPrice: 2450, compAvg: 2390, status: "Underpriced", stock: true },
  { id: 2, name: "Gucci Horsebit Loafers", ourPrice: 950, compAvg: 980, status: "Competitive", stock: true },
  { id: 3, name: "Saint Laurent Kate", ourPrice: 1850, compAvg: 1950, status: "Competitive", stock: false },
  { id: 4, name: "Balenciaga City Bag", ourPrice: 2100, compAvg: 2050, status: "Underpriced", stock: true },
];

const keywordGaps = [
  { keyword: "vintage hermes kelly", volume: "12K", diff: 85, competitor: "LuxuryDirect" },
  { keyword: "quiet luxury fashion trends", volume: "45K", diff: 42, competitor: "ModaVibe" },
  { keyword: "rolex second hand market", volume: "28K", diff: 76, competitor: "LuxuryDirect" },
];

const socialKPIs = [
  { label: "Follower Growth", fashcon: "+12.5%", comp1: "+8.2%", comp2: "+15.1%" },
  { label: "Engagement Rate", fashcon: "4.8%", comp1: "3.2%", comp2: "5.1%" },
];


export function CompetitorIntelligence() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'product');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleMarketScan = () => {
    setIsScanning(true);
    // Logic to call server action would go here
    setTimeout(() => setIsScanning(false), 2000);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Competitor Intelligence</h1>
          <p className="text-muted-foreground">Strategic market insights and competitive positioning.</p>
        </div>
        <Button 
          onClick={handleMarketScan} 
          disabled={isScanning}
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex gap-2 items-center"
        >
          <RefreshCcw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning...' : 'Run Market Scan'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-black/40 border border-white/10 backdrop-blur-md p-1 mb-6 h-12">
          <TabsTrigger value="product" className="data-[state=active]:bg-white/10 data-[state=active]:text-white px-6">Product Intel</TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-white/10 data-[state=active]:text-white px-6">SEO Share</TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-white/10 data-[state=active]:text-white px-6">Social Radar</TabsTrigger>
        </TabsList>

        {/* Tab 1: Product & Price Intel */}
        <TabsContent value="product">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-black/20 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Market Price Monitoring</CardTitle>
                <CardDescription>Real-time comparison of tracked inventory against luxury market averages.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="hover:bg-transparent border-white/10">
                      <TableHead className="text-white font-medium">Product Name</TableHead>
                      <TableHead className="text-white font-medium text-right">Our Price</TableHead>
                      <TableHead className="text-white font-medium text-right">Comp. Avg</TableHead>
                      <TableHead className="text-white font-medium">Stock Status</TableHead>
                      <TableHead className="text-white font-medium">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trackedProducts.map((product) => (
                      <TableRow key={product.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="font-medium text-white">{product.name}</TableCell>
                        <TableCell className="text-right text-white font-mono">${product.ourPrice.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-white/70 font-mono">${product.compAvg.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={product.stock ? "outline" : "destructive"} className={product.stock ? "bg-green-500/10 text-green-400 border-green-500/20" : ""}>
                            {product.stock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {product.status === "Underpriced" ? (
                              <>
                                <TrendingDown className="w-4 h-4 text-red-400" />
                                <span className="text-red-400 text-sm">Underpriced</span>
                              </>
                            ) : (
                              <>
                                <TrendingUp className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 text-sm">Competitive</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Tab 2: SEO & Traffic Share */}
        <TabsContent value="seo">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card className="bg-black/20 border-white/10 backdrop-blur-xl overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Organic Traffic Share</CardTitle>
                    <CardDescription>Estimated monthly visits compared to key competitors.</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-white/5 border-white/10 text-white gap-1">
                    <Globe className="w-3 h-3" /> Worldwide
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <defs>
                      <linearGradient id="colorFash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorComp1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      stroke="#475569" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Fashcon" 
                      stroke="#fff" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorFash)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="LuxuryDirect" 
                      stroke="#94a3b8" 
                      strokeDasharray="5 5"
                      fillOpacity={1} 
                      fill="url(#colorComp1)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="ModaVibe" 
                      stroke="#475569" 
                      strokeDasharray="5 5"
                      fillOpacity={0} 
                    />
                    <Legend verticalAlign="top" height={36}/>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/20 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Search className="w-4 h-4 text-primary" /> Keyword Gaps
                  </CardTitle>
                  <CardDescription>High-value search terms competitors rank for that we miss.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {keywordGaps.map((gap, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                        <div>
                          <p className="text-white font-medium">{gap.keyword}</p>
                          <p className="text-xs text-muted-foreground">Via {gap.competitor}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-mono text-sm">{gap.volume}</p>
                          <p className="text-xs text-primary">Diff: {gap.diff}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" /> Authority Trends
                  </CardTitle>
                  <CardDescription>Domain authority (DA) compared to peers.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[180px]">
                  <div className="text-center space-y-2">
                    <div className="text-5xl font-bold text-white">42</div>
                    <div className="text-green-400 text-sm flex items-center justify-center gap-1">
                      <ArrowUpRight className="w-4 h-4" /> +2 this month
                    </div>
                    <p className="text-muted-foreground text-xs px-12">Average competitor DA is 48. Target +6 by Q3.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>

        {/* Tab 3: Social Radar */}
        <TabsContent value="social">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {socialKPIs.map((kpi, i) => (
                <Card key={i} className="bg-black/20 border-white/10 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{kpi.fashcon}</div>
                        <div className="text-[10px] text-muted-foreground mt-1 font-medium">FASHCON</div>
                      </div>
                      <div className="text-center border-l border-white/5">
                        <div className="text-2xl font-bold text-white/50">{kpi.comp1}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">LUX DIRECT</div>
                      </div>
                      <div className="text-center border-l border-white/5">
                        <div className="text-2xl font-bold text-white/50">{kpi.comp2}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">MODA VIBE</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-black/20 border-white/10 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Ad Swipe File</CardTitle>
                  <CardDescription>Recent Meta & Instagram ad creatives from competitors.</CardDescription>
                </div>
                <Instagram className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border border-white/10">
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                        <Monitor className="w-8 h-8 text-white/20 group-hover:text-white/40 transition-colors" />
                      </div>
                      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black to-transparent">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-white/60 bg-white/10 px-2 py-0.5 rounded">MODA VIBE</span>
                          <ExternalLink className="w-3 h-3 text-white/40 hover:text-white transition-colors cursor-pointer" />
                        </div>
                        <p className="text-[10px] text-white/80 mt-1 line-clamp-2">Exclusive summer collection now live. Shop the look...</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Integration Comments */}
      {/* 
        DEVELOPER NOTE:
        To integrate with external APIs:
        1. pricing: Use SerpApi (Google Shopping) or custom scrapers via Next.js Server Actions.
        2. SEO: Integrate Ahrefs or SEMrush API to fetch traffic and keyword gap data.
        3. Social: Use Meta Ad Library API or scraping services like Brandwatch to populate 'recentAds'.
        
        The data should be cached in the MongoDB 'CompetitorIntel' collection to avoid redundant API costs.
      */}
    </div>
  );
}
