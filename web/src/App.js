import React, { useEffect, useState } from 'react';
import './App.css';

const App = () => {
	const [userCredentials, setUserCredentials] = useState([]);

	useEffect(() => {
    // setUserCredentials();
	}, []);

	return (
		<div>
			<div className='content'>
				<div className='title'>Welcome to Hedera Events</div>
				<div className='events_list'>
          <div className='event_block'>
            <div className='event_header'>
              <div className='event_title'>Hello Tokenization Welcome Webinar</div>
              <div className='event_subtitle'>Welcome to the Hedera21 Tokenization hackathon! For our first webinar, we'll be joined by Hedera's Developer Evangelist Cooper Kunz. Cooper will be providing an overview of the hackathon.</div>
            </div>
            <div className='event_bottom'>
              <div className='btn'>Take part</div>
            </div>
          </div>
          <div className='event_block'>
            <div className='event_header'>
              <div className='event_title'>Deep Dive into Sponsor Challenges</div>
              <div className='event_subtitle'>For this webinar, we'll be joined by all the Hedera21 challenge sponsors who will be doing a deep dive into their challenge and will provide examples of the types of applications and programs they are looking for.</div>
            </div>
            <div className='event_bottom'>
              <div className='btn'>Take part</div>
            </div>
          </div>
          <div className='event_block'>
            <div className='event_header'>
              <div className='event_title'>Deep Dive into DragonGlass</div>
              <div className='event_subtitle'>For this webinar, we'll be joined by Ashu Mahajan, Director of Product Management, and Shawn Traynor, Head of Solutions at OpenCrowd. They will be giving you a deep dive on DragonGlass, a developer tool that allows you to access high quality historical and real-time data on the Hedera Hashgraph network.</div>
            </div>
            <div className='event_bottom'>
              <div className='btn'>Take part</div>
            </div>
          </div>
				</div>
			</div>
			<div className='copyright'>Hello future</div>
		</div>
	);
};

export default App;
