'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Beaker,
  Code,
  Package,
  ArrowRight,
  Github,
  ExternalLink,
} from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('experiments')

  return (
    <main className='min-h-screen bg-gradient-to-b from-background to-muted/20'>
      {/* Hero Section */}
      <section className='max-w-6xl mx-auto py-12 px-4 lg:px-8 flex flex-col lg:flex-row space-y-8 lg:space-y-0'>
        <div className='w-full lg:w-1/2 flex flex-col justify-center'>
          <motion.div
            className='max-w-sm lg:max-w-md space-y-6 w-full mx-auto lg:mx-0 text-center lg:text-left'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className='mb-2 text-sm py-1 px-3 bg-yellow-100 text-yellow-800 hover:bg-yellow-200'>
              Welcome to my digital playground
            </Badge>
            <h1 className='font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground'>
              Welcome to my <span className='line-through'>graveyard</span>{' '}
              portfolio of{' '}
              <span className='text-red-500 font-bold'>hacky experiments!</span>
            </h1>
            <p className='text-muted-foreground text-lg md:text-xl'>
              Here lies the remains of some of my projects. Maybe you'll learn.
              Mostly you'll laugh. Definitely you'll enjoy.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start'>
              <Button size='lg' className='gap-2'>
                See Experiments <ArrowRight size={16} />
              </Button>
              <Button size='lg' variant='outline'>
                About Me
              </Button>
            </div>
          </motion.div>
        </div>
        <motion.div
          className='w-full lg:w-1/2'
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className='relative'>
            {/* Decorative elements */}
            <div className='absolute -top-6 -left-6 w-20 h-20 bg-primary/10 rounded-full blur-xl'></div>
            <div className='absolute -bottom-8 -right-8 w-28 h-28 bg-yellow-200/20 rounded-full blur-xl'></div>
            <div className='absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-24 bg-primary/20 rounded-full blur-lg'></div>

            {/* Gradient border effect */}
            <div className='absolute inset-0 bg-gradient-to-br from-background via-primary/20 to-yellow-200/30 rounded-2xl p-1'>
              <div className='absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl'></div>
            </div>

            {/* Pattern overlay */}
            <div className='absolute inset-0 opacity-10 mix-blend-overlay'>
              <div
                className='w-full h-full'
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 20px 20px, #f0f0f0 2px, transparent 0), radial-gradient(circle at 40px 70px, #f0f0f0 2px, transparent 0), radial-gradient(circle at 120px 120px, #f0f0f0 2px, transparent 0)',
                  backgroundSize: '150px 150px',
                }}
              ></div>
            </div>

            {/* Main image with softer background */}
            <div className='relative rounded-xl overflow-hidden p-4 md:p-6 bg-neutral-800'>
              <img
                alt='Hacky experiments illustration'
                src='/hero.png'
                className='w-full h-[400px] sm:h-[450px] md:h-[500px] object-contain rounded-lg'
              />

              {/* Floating elements */}
              <motion.div
                className='absolute top-10 right-10 w-12 h-12 bg-primary/10 rounded-full'
                animate={{ y: [0, -10, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 3,
                  ease: 'easeInOut',
                }}
              ></motion.div>
              <motion.div
                className='absolute bottom-16 left-10 w-8 h-8 bg-yellow-200/30 rounded-full'
                animate={{ y: [0, 10, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 2.5,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              ></motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Content Tabs Section */}
      <section className='max-w-6xl mx-auto px-4 lg:px-8 py-16'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className='text-center mb-12'
        >
          <h2 className='text-3xl font-bold tracking-tight mb-4'>
            Explore My Digital Creations
          </h2>
          <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
            A collection of weird, wonderful, and occasionally useful things
            I've built.
          </p>
        </motion.div>

        <Tabs
          defaultValue='experiments'
          className='w-full'
          onValueChange={setActiveTab}
        >
          <div className='flex justify-center mb-8'>
            <TabsList className='grid grid-cols-3 w-full max-w-md'>
              <TabsTrigger
                value='experiments'
                className='flex items-center gap-2'
              >
                <Beaker size={16} />
                <span className='hidden sm:inline'>Experiments</span>
              </TabsTrigger>
              <TabsTrigger value='snippets' className='flex items-center gap-2'>
                <Code size={16} />
                <span className='hidden sm:inline'>Snippets</span>
              </TabsTrigger>
              <TabsTrigger value='products' className='flex items-center gap-2'>
                <Package size={16} />
                <span className='hidden sm:inline'>Products</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='experiments' className='space-y-8'>
            <motion.div
              className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {experiments.map((experiment, index) => (
                <ExperimentCard key={index} experiment={experiment} />
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value='snippets' className='space-y-8'>
            <motion.div
              className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {snippets.map((snippet, index) => (
                <SnippetCard key={index} snippet={snippet} />
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value='products' className='space-y-8'>
            <motion.div
              className='grid grid-cols-1 md:grid-cols-2 gap-8'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {products.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  )
}

// Card Components
function ExperimentCard({ experiment }: { experiment: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className='h-full overflow-hidden group hover:shadow-md transition-all duration-300'>
        <div className='overflow-hidden h-48'>
          <img
            src={experiment.image || '/placeholder.svg'}
            alt={experiment.title}
            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
          />
        </div>
        <CardHeader>
          <div className='flex justify-between items-start'>
            <CardTitle>{experiment.title}</CardTitle>
            <Badge
              variant={experiment.status === 'Live' ? 'default' : 'secondary'}
            >
              {experiment.status}
            </Badge>
          </div>
          <CardDescription>{experiment.description}</CardDescription>
        </CardHeader>
        <CardFooter className='flex justify-between'>
          <div className='flex gap-2'>
            {experiment.tags.map((tag: string, i: number) => (
              <Badge key={i} variant='outline'>
                {tag}
              </Badge>
            ))}
          </div>
          <Button variant='ghost' size='sm' className='gap-1'>
            <ArrowRight size={14} />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

function SnippetCard({ snippet }: { snippet: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className='h-full group hover:shadow-md transition-all duration-300'>
        <CardHeader>
          <div className='flex justify-between items-start'>
            <CardTitle className='flex items-center gap-2'>
              <Code size={18} className='text-primary' />
              {snippet.title}
            </CardTitle>
          </div>
          <CardDescription>{snippet.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='bg-muted rounded-md p-3 text-sm font-mono overflow-x-auto'>
            <code>{snippet.preview}</code>
          </div>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Badge variant='outline'>{snippet.language}</Badge>
          <Button variant='ghost' size='sm' className='gap-1'>
            View <ArrowRight size={14} />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

function ProductCard({ product }: { product: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className='h-full overflow-hidden group hover:shadow-md transition-all duration-300'>
        <div className='flex flex-col md:flex-row'>
          <div className='md:w-2/5 overflow-hidden'>
            <img
              src={product.image || '/placeholder.svg'}
              alt={product.title}
              className='w-full h-full object-cover md:h-full group-hover:scale-105 transition-transform duration-500'
            />
          </div>
          <div className='md:w-3/5'>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <CardTitle>{product.title}</CardTitle>
                <Badge>{product.status}</Badge>
              </div>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>{product.details}</p>
            </CardContent>
            <CardFooter className='flex justify-between'>
              <div className='flex gap-2'>
                {product.links.github && (
                  <Button variant='outline' size='sm' className='gap-1'>
                    <Github size={14} /> GitHub
                  </Button>
                )}
                {product.links.live && (
                  <Button size='sm' className='gap-1'>
                    <ExternalLink size={14} /> Visit
                  </Button>
                )}
              </div>
            </CardFooter>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// Sample Data
const experiments = [
  {
    title: 'AI Color Palette Generator',
    description: 'Generate color palettes using machine learning algorithms',
    image: '/placeholder.svg?height=300&width=400',
    status: 'Live',
    tags: ['AI', 'Design'],
  },
  {
    title: 'WebGL Particle System',
    description: 'Interactive particle system built with WebGL and Three.js',
    image: '/placeholder.svg?height=300&width=400',
    status: 'WIP',
    tags: ['WebGL', '3D'],
  },
  {
    title: 'Neural Network Visualizer',
    description: 'Visualize how neural networks learn and make predictions',
    image: '/placeholder.svg?height=300&width=400',
    status: 'Live',
    tags: ['AI', 'Visualization'],
  },
]

const snippets = [
  {
    title: 'React Custom Hook',
    description: 'A custom hook for handling form validation',
    language: 'TypeScript',
    preview:
      'const useFormValidation = (initialState, validate) => {\n  const [values, setValues] = useState(initialState);\n  // More code...\n}',
  },
  {
    title: 'CSS Grid Layout',
    description: 'A responsive grid layout with auto-placement',
    language: 'CSS',
    preview:
      '.grid-container {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n  gap: 1rem;\n}',
  },
  {
    title: 'WebSocket Connection',
    description: 'Set up a WebSocket connection with reconnect logic',
    language: 'JavaScript',
    preview:
      'function createWebSocketConnection(url) {\n  const ws = new WebSocket(url);\n  // Connection logic...\n}',
  },
]

const products = [
  {
    title: 'DevToolkit Pro',
    description: 'A suite of tools for developers to streamline their workflow',
    details:
      'Includes code formatter, API tester, and performance analyzer. Built with Electron and React.',
    image: '/placeholder.svg?height=300&width=400',
    status: 'Beta',
    links: {
      github: 'https://github.com',
      live: 'https://example.com',
    },
  },
  {
    title: 'PixelPerfect',
    description: 'Design tool for pixel-perfect web layouts',
    details:
      'Helps designers and developers create precise layouts with real-time preview and code generation.',
    image: '/placeholder.svg?height=300&width=400',
    status: 'Alpha',
    links: {
      github: 'https://github.com',
      live: null,
    },
  },
]
