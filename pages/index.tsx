import type { NextPage, GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { sanityClient, urlFor } from '../sanity'
import { Collection } from '../typing'
import { useDispatch, useSelector } from 'react-redux'
import { selectColormode, updateColorMode } from '../reducer/colorSlice'

type Props = {
  collections: Collection[]
}
const Home = ({ collections }: Props) => {
  const dispatch = useDispatch()
  const colorMode = useSelector(selectColormode)

  console.log('colorMode>>>', colorMode)

  return (
    <div
      className={`mx-auto flex min-h-screen max-w-7xl flex-col py-20 px-10 2xl:px-0 ${
        colorMode === 'white' && 'bg-slate-50'
      }
      ${colorMode === 'blue' && 'royal-bg'}
      ${colorMode === 'red' && 'royalred-bg'}
      `}
    >
      <Head>
        <title>ZH NFT Drop</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1
        className={`mb-10 text-4xl font-extralight ${
          colorMode === 'white' && 'text-black'
        } ${colorMode === 'blue' && 'text-white'} ${
          colorMode === 'red' && 'text-white'
        }`}
      >
        The{' '}
        <span
          className={`font-extrabold underline decoration-pink-600/50
          ${colorMode === 'blue' && 'decoration-white/50'}
          ${colorMode === 'red' && 'decoration-green-600/50'}`}
        >
          ZH
        </span>{' '}
        NFT Market Place
      </h1>
      <main
        className={`bg-slate-100 p-10 shadow-xl ${
          colorMode === 'white' && 'shadow-pink-400/20'
        }
        ${colorMode === 'blue' && 'shadow-blue-400/30'}
        ${colorMode === 'red' && 'shadow-red-400/20'} `}
      >
        <div className="grid space-x-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {collections.map((collection) => (
            <Link href={`/nft/${collection.slug.current}`}>
              <div
                key={collection._id}
                className="flex cursor-pointer flex-col items-center transition-all duration-200 hover:scale-105"
              >
                <img
                  className="h-96 w-60 rounded-2xl object-cover"
                  src={urlFor(collection.mainImage).url()}
                  alt={collection.title}
                />
                <div className="p-5">
                  <h2 className="text-3xl">{collection.title}</h2>
                  <p className="mt-2 text-sm text-gray-400">
                    {collection.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <footer
        className={`mt-10 flex w-full flex-1 flex-wrap items-center justify-between space-y-3 px-2 lg:flex-row lg:space-y-0 
        ${colorMode === 'white' && 'text-slate-700'} ${
          colorMode === 'blue' && 'text-white'
        } ${colorMode === 'red' && 'text-white'}`}
      >
        <div>
          <h2>
            The
            <span
              className={`mx-1 underline decoration-pink-600/50         
              ${colorMode === 'blue' && 'decoration-white/50'}
              ${colorMode === 'red' && 'decoration-green-600/50'}`}
            >
              ZH
            </span>
            NFT Market Place
          </h2>
        </div>
        <div>
          <p className=" text-sm font-extralight ">
            The NFT is only for Demo purposes
          </p>
        </div>
        <div className={`flex flex-row items-center justify-center space-x-3`}>
          <div
            onClick={() => dispatch(updateColorMode('white'))}
            className={`h-4 w-4 cursor-pointer rounded-full bg-slate-50 bg-opacity-50 shadow-sm ${
              colorMode === 'white' &&
              ' bg-slate-100 bg-opacity-100 shadow-lg  '
            } shadow-blue-400/70 transition-all duration-200 hover:scale-105 hover:animate-pulse`}
          />
          <div
            onClick={() => dispatch(updateColorMode('blue'))}
            className={`${
              colorMode === 'blue' &&
              'bg-opacity-100 shadow-lg shadow-blue-400/70'
            } royal-bg h-4 w-4 cursor-pointer rounded-full bg-opacity-50 shadow-sm shadow-blue-800/70   transition-all duration-200 hover:scale-105 hover:animate-pulse`}
          />
          <div
            onClick={() => dispatch(updateColorMode('red'))}
            className={`${
              colorMode === 'red' &&
              'bg-opacity-100 shadow-lg shadow-red-400/70'
            } royalred-bg h-4 w-4 cursor-pointer rounded-full bg-opacity-50 shadow-sm shadow-red-800/70   transition-all duration-200 hover:scale-105 hover:animate-pulse`}
          />
        </div>
      </footer>
    </div>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps = async () => {
  const query = `*[_type == "collection"]{
    _id, 
    title,
    address,
    description,
    nftCollectionName,
    mainImage {
     asset
   },
   previewImage {
     asset
   },
   slug {
     current
   },
   creator->{
     _id,
     name,
     address,
     slug {current}
   },
   }`
  const collections = await sanityClient.fetch(query)

  return {
    props: {
      collections,
    },
  }
}
