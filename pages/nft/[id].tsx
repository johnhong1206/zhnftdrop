import React, { useEffect, useState } from 'react'
import Head from 'next/head'

import {
  useAddress,
  useDisconnect,
  useMetamask,
  useNFTDrop,
} from '@thirdweb-dev/react'
import type { NextPage, GetServerSideProps } from 'next'
import { sanityClient, urlFor } from '../../sanity'
import { Collection } from '../../typing'
import Link from 'next/link'
import { BigNumber } from 'ethers'
import toast, { Toaster } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { selectColormode } from '../../reducer/colorSlice'

interface Props {
  collection: Collection
}

function NFTDropPafe({ collection }: Props) {
  // web3 auth
  const connectMetamask = useMetamask()
  const address = useAddress()
  const disconnect = useDisconnect()
  // useState variable
  const [claimedSupply, setClaimedSupply] = useState<number>(0)
  const [totalSupply, setTotalSupply] = useState<BigNumber>()
  const [loading, setLoading] = useState<boolean>(true)
  const [priceETH, setPriceETH] = useState<string>()
  const nftDrop = useNFTDrop(collection.address)
  const [nftList, setnftList] = useState<any>([])
  const [unclaimedNFTs, setUnclaimedNFTs] = useState<any>([])
  const [activeNFT, setActiveNFT] = useState<number>(0)
  const [phase, setPhase] = useState<string>('unclaimed')
  const myNFTDrop = useNFTDrop(address)
  const [myNFT, setMyNft] = useState<any>([])
  const colorMode = useSelector(selectColormode)

  useEffect(() => {
    if (!nftDrop) return

    const fetchNFTDropData = async () => {
      const all = await nftDrop?.getAll()
      const unclaimedNFTs = await nftDrop?.getAllUnclaimed()
      setUnclaimedNFTs(unclaimedNFTs)
      setnftList(all)
    }
    fetchNFTDropData()
  }, [nftDrop])

  useEffect(() => {
    if (!nftDrop || !address) return
    const fetchmyNFTDropData = async () => {
      const myNFT = await nftDrop?.getOwned(address)
      console.log('myNFT', myNFT)
      setMyNft(myNFT)
    }
    fetchmyNFTDropData()
  }, [address, nftDrop])

  useEffect(() => {
    if (!nftDrop) return

    const fetchNFTDropData = async () => {
      setLoading(true)
      const claimed = await nftDrop.getAllClaimed()
      const total = await nftDrop.totalSupply()

      setClaimedSupply(claimed.length)
      setTotalSupply(total)
      setLoading(false)
    }
    fetchNFTDropData()
  }, [nftDrop])

  useEffect(() => {
    if (!nftDrop) return
    const fetchNFTPrice = async () => {
      const claimedConditions = await nftDrop.claimConditions.getAll()
      setPriceETH(claimedConditions?.[0].currencyMetadata.displayValue)
    }

    fetchNFTPrice()
  }, [nftDrop])

  const mintNFT = () => {
    console.log('activeNFT', activeNFT)
    if (!nftDrop || !address) return
    const quantity = 1
    setLoading(true)
    const notification = toast.loading(`Minting...`, {
      style: {
        background: 'white',
        color: 'green',
        fontWeight: 'bolder',
        fontSize: '17px',
        padding: '20px',
      },
    })

    nftDrop
      ?.claimTo(address, quantity)
      .then(async (tx) => {
        //
        //let choosenNFTNumber = Number(activeNFT)
        const receipt = tx[activeNFT].receipt
        const claimedTokenId = tx[activeNFT].id
        const claimedNFT = await tx[activeNFT].data()
        toast('Yeay... You successfully Minted', {
          duration: 8000,
          style: {
            background: 'green',
            color: 'white',
            fontWeight: 'bolder',
            fontSize: '17px',
            padding: '20px',
          },
        })

        console.log(receipt)
        console.log(claimedTokenId)
        console.log(claimedNFT)
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setLoading(false)
        toast.dismiss(notification)
      })
  }
  console.log(unclaimedNFTs[0]?.image)

  return (
    <div className="flex h-screen flex-col overflow-hidden lg:grid lg:grid-cols-10">
      <Head>
        <title>ZH NFT Drop || {collection.nftCollectionName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster position="bottom-center" />
      {/*Left */}
      <div
        className={`bg-gradient-to-br from-cyan-800 to-rose-500 lg:col-span-4  ${
          colorMode === 'blue' && 'royal-bg'
        }
        ${colorMode === 'red' && 'royalred-bg'}`}
      >
        <div className="flex flex-col items-center justify-center py-2 lg:min-h-screen">
          <div className=" rounded-xl bg-gradient-to-br from-yellow-400 to-purple-600 p-2">
            <img
              src={urlFor(collection.previewImage).url()}
              alt="pic"
              className="w-44 rounded-xl object-cover lg:h-96 lg:w-72"
            />
          </div>

          <div className="space-y-2 p-5 text-center">
            <h1 className="text-4xl font-bold text-white">
              {collection.nftCollectionName}
            </h1>
            <h2 className=" text-xl text-gray-300">{collection.description}</h2>
          </div>
        </div>
      </div>

      {/*Right */}
      <div className="flex flex-1 flex-col overflow-y-scroll p-12 lg:col-span-6">
        {/*Header */}
        <header className="flex items-center justify-between">
          <Link href={`/`}>
            <h1 className="w-52 cursor-pointer text-xl font-extralight sm:w-80">
              The{' '}
              <span className=" font-extrabold underline decoration-pink-600/50">
                ZH
              </span>{' '}
              NFT Market Place
            </h1>
          </Link>

          <button
            onClick={() => (address ? disconnect() : connectMetamask())}
            className="rounded-full bg-rose-400 px-4 py-2 text-xs font-bold text-white lg:py-3 lg:px-5 lg:text-base"
          >
            {address ? ' Sign Out' : 'Sign In'}
          </button>
        </header>
        <hr className="my-2 border" />
        {address && (
          <p className="text-center text-sm text-rose-400">
            Your are logged in with wallet {address.substring(0, 5)}...
            {address.substring(address.length - 5)}
          </p>
        )}
        {/*Content */}
        <div className="flex flex-1 flex-col items-center space-y-6  text-center lg:mt-10 lg:justify-center lg:space-y-0">
          <img
            className="w-80 object-cover pb-10 lg:h-40"
            src={urlFor(collection.mainImage).url()}
            alt="content img"
          />
          <h1 className=" text-3xl font-bold lg:text-5xl lg:font-extrabold">
            {collection.title}
          </h1>
          {loading ? (
            <p className="animate-pulse pt-2 text-xl text-green-500 lg:py-0">
              loading Suppy Count...
            </p>
          ) : (
            <p className="pt-2 text-xl text-green-500 lg:py-0">
              {claimedSupply}/{totalSupply?.toString()} NFT's Claimed
            </p>
          )}
          {loading && (
            <img
              src={`https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif`}
              alt="loading"
              className="h-80 w-80 object-contain"
            />
          )}
        </div>
        {!loading && unclaimedNFTs[0]?.image && (
          <div className="flex flex-col items-center justify-center ">
            <img
              src={unclaimedNFTs[0]?.image}
              alt="pic"
              className="w-44 rounded-xl object-cover lg:h-96 lg:w-72"
            />
            <h2 className="font-extralight">Next Mint NFT </h2>
          </div>
        )}
        <hr className="my-3 inline-flex border" />
        <div className="flex flex-row items-center justify-center space-x-6">
          <div
            onClick={() => setPhase('all')}
            className={`cursor-pointer ${
              phase === 'all' && 'font-bold underline decoration-pink-600/50'
            }`}
          >
            <h2>All</h2>
          </div>
          <div
            onClick={() => setPhase('unclaimed')}
            className={`cursor-pointer ${
              phase === 'unclaimed' &&
              'font-bold underline decoration-pink-600/50'
            }`}
          >
            <h2>Unclaimed</h2>
          </div>
          <div
            onClick={() => setPhase('owned')}
            className={`cursor-pointer ${
              phase === 'owned' && 'font-bold underline decoration-pink-600/50'
            }`}
          >
            <h2>Owned</h2>
          </div>
        </div>
        <hr className="my-3 inline-flex border" />

        <div className="mx-auto mb-10  grid grid-flow-row-dense gap-3  md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {!loading &&
            phase === 'unclaimed' &&
            unclaimedNFTs?.map((nft: any, index: any) => (
              <div className="">
                {nft?.name}
                <img
                  src={nft?.image}
                  alt="pic"
                  className="w-44 cursor-pointer rounded-xl object-cover lg:h-44 lg:w-72"
                />
              </div>
            ))}
          {!loading &&
            phase === 'all' &&
            nftList?.map((nft: any, index: any) => (
              <div className="">
                {nft?.name}
                <img
                  src={nft?.metadata.image}
                  alt="pic"
                  className="w-44 cursor-pointer rounded-xl object-cover lg:h-44 lg:w-72"
                />
              </div>
            ))}
          {!loading &&
            phase === 'owned' &&
            myNFT?.map((nft: any, index: any) => (
              <div className="">
                {nft?.name}
                <img
                  src={nft?.metadata.image}
                  alt="pic"
                  className="w-44 cursor-pointer rounded-xl object-cover lg:h-44 lg:w-72"
                />
              </div>
            ))}
        </div>
        {/*Mint Button */}
        {phase === 'unclaimed' && (
          <button
            onClick={mintNFT}
            disabled={
              loading || claimedSupply === totalSupply?.toNumber() || !address
            }
            className="h-12 w-full rounded-full bg-red-300 text-white disabled:bg-gray-400"
          >
            {loading ? (
              <>Loading...</>
            ) : claimedSupply === totalSupply?.toNumber() ? (
              <>SOLD OUT</>
            ) : !address ? (
              <>Sign in to Mint</>
            ) : (
              <span>Mint NFT({priceETH}ETH)</span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default NFTDropPafe
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const query = `*[_type == "collection" && slug.current == $id][0]{
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
  const collection = await sanityClient.fetch(query, { id: params?.id })

  if (!collection) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      collection,
    },
  }
}
