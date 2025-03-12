import { useRouter } from 'next/navigation'

function AboutPage() {
  const router = useRouter()
  return (
    <div className='container mx-auto py-6 sm:py-12'>
      <h1>About Me</h1>
      <img
        src='/images/me.png'
        className='object-cover rounded-full w-72 h-72 mx-auto mb-12'
      />
      <div className='w-full px-4 font-secondary'>
        <blockquote className='mt-6 pl-2 sm:text-lg md:text-xl italic border-l-4 text-gray-500 border-gray-500'>
          "All life is an experiment. The more experiments you make the better."
        </blockquote>
        <div className='mt-2 text-gray-500 m:text-base md:text-lg '>
          Ralph Waldo Emerson
        </div>
        <p className='mt-6 sm:text-lg md:text-xl'>
          Hello! I'm Bilal. I like to build things and try out some weird hacky
          experiments. And you can find some of them{' '}
          <button
            className='text-palette-primary font-bold focus:outline-none'
            onClick={() => router.push('/blog')}
          >
            here
          </button>
          .
        </p>
        <p className='mt-6 sm:text-lg md:text-xl'>
          I am at my happiest in the thick of the creation process, going from
          ideation to execution. Thing don't always work out but I love the
          process and hope to share some of it here. Would love to have you
          along for the ride. Let's have an adventure together!
        </p>
        <p className='mt-6 sm:text-lg md:text-xl'>
          If you're curious about how I build stuff you can read about my
          process{' '}
          <button
            className='text-palette-primary font-bold focus:outline-none'
            onClick={() => router.push('/process')}
          >
            here
          </button>
          .
        </p>
        <p className='mt-6 sm:text-lg md:text-xl'>
          You can also follow me on
          <a
            href='https://twitter.com/deepwhitman'
            target='_blank'
            rel='noreferrer'
            className='text-palette-primary font-bold px-1'
          >
            Twitter
          </a>{' '}
          to catch the latest shenanigans I'm getting myself into.
        </p>
        <p className='mt-6 sm:text-lg md:text-xl'>
          Oh and in case you are curious about the awesome illustration used on
          the home page, I have this{' '}
          <a
            href='https://absurd.design/'
            target='_blank'
            rel='noreferrer'
            className='text-palette-primary font-bold px-1'
          >
            amazing artist
          </a>{' '}
          to thank.
        </p>
        <p className='mt-6 sm:text-lg md:text-xl'>
          Happy travels.{' '}
          <span role='img' aria-label='smiling-emoji'>
            😀
          </span>
        </p>
        <p className='mt-6 sm:text-lg md:text-xl'>Bilal</p>
      </div>
    </div>
  )
}

export default AboutPage
