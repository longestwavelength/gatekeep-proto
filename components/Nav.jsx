"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { signIn, signOut, useSession, getProviders } from 'next-auth/react';


const Nav = () => {
  const { data: session } = useSession();
  const [ providers, setProviders ] = useState(null);
  const [toggleDropdown, setToggleDropdown] = useState(false);

  useEffect(() => {
    const setUpProviders = async () => {
      const response = await getProviders();

      setProviders(response)
    }

    setUpProviders();
  }, [])
  return (
    <nav className="flex-between w-full mb-16 pt-3">
      <Link href="/" className="flex gap-2 flex-center">
        <Image src="/assets/images/trailsway-logo.png" alt="TrailsWay logo" width={30} height={30} className="object-contain rounded-lg"/>
        <p className="logo_text">TrailsWay</p>
      </Link>

      

      {/* For Desktop Navigation */}
      <div className="sm:flex hidden">
        {session?.user ? (
          <div className="flex gap-3 md:gap-5">
            <Link href="https://trailsway.substack.com/" 
            target="_blank"
            className="black_btn">
              faq
            </Link>

            <Link href="/create-trail" className="black_btn">
              Create a Trail
            </Link>

            <button type="button" onClick={signOut} className="outline_btn">
              Sign Out
            </button>

            <Link href="/profile">
              <Image src={session?.user.image} width={37} height={37} className="rounded-full" 
              alt="profile-pic" />
            </Link>
          </div>
        ): (
          <>
            {providers && Object.values(providers).map((provider) => (
              <button type="button" key={provider.name}
              onClick={() => signIn(provider.id)} className="black_btn">
                Sign In
              </button>
            ))}
          </>
        )}
      </div>

      {/* For Mobile Navigation */}
      <div className="sm:hidden flex relative">
        {session?.user ? (
          <div className="flex">
            <Image src={session?.user.image} width={37} height={37} className="rounded-full" 
              alt="profile-pic" onClick={() => 
              setToggleDropdown((prev) => !prev)} />

              {toggleDropdown && (
                <div className="dropdown">

                  <Link href="/profile" 
                  className="dropdown_link" onClick={() => setToggleDropdown(false)}>
                    My Profile
                  </Link>

                  <Link href="/create-trail" 
                  className="dropdown_link" onClick={() => setToggleDropdown(false)}>
                    Create a Trail
                  </Link>

                  <Link href="https://trailsway.substack.com/" 
                  className="dropdown_link" target="_blank"
                  onClick={() => setToggleDropdown(false)}>
                    faq
                  </Link>

                  <button type="button" 
                  onClick={() => {setToggleDropdown(false); signOut();}}
                  className="mt-5 w-full black_btn">
                    Sign Out
                  </button>

                </div>
              )}
          </div>
        ): (
          <>
            {providers && Object.values(providers).map((provider) => (
              <button type="button" key={provider.name}
              onClick={() => signIn(provider.id)} className="black_btn">
                Sign In
              </button>
            ))}
          </>
        )}
      </div>
    </nav>
  )
}

export default Nav