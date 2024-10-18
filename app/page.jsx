"use client"

import { useState, useEffect } from "react";
import Feed from "@components/Feed";

const Home = () => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <section className="w-full flex-center flex-col">
            <h1 className="head_text text-center">
                Create new trails
                <br className="max-md:hidden" />
                <span className="orange_gradient text-center">& Find a trail near you</span>
            </h1>
            <p className="desc text-center">
                Gatekeep is for finding, creating new trails & sharing trails with your friends.
            </p>
            
            {isClient && <Feed />}
        </section>
    )
}

export default Home