import React, { useEffect, useState } from 'react';
import {
	withRouter, Route, Switch, Redirect,
} from 'react-router-dom';
import './App.css';

const qrcode = require('qrcode-generator');

const App = () => {
	const [userCredentials, setUserCredentials] = useState([]);
	const [eventData, setEventData] = useState({
		title: '',
		description: '',
		price: '',
		link: '',
	});
	const [redirect, setRedirect] = useState({
		status: false,
		path: '/',
	});

	useEffect(() => {
		if (localStorage.getItem('eventData')) {
			const eventDataTemp = JSON.parse(localStorage.getItem('eventData'));
			setEventData(eventDataTemp);
		}
	}, []);

	const setInput = (e, type) => {
    setEventData({ ...eventData, [type]: e.target.value });
  };

	const createEvent = () => {
		// eventData
		localStorage.setItem('eventData', JSON.stringify(eventData));

		const linkHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

		setEventData({
			title: '',
			description: '',
			price: '',
			link: `${document.location.origin}/event/${linkHash.substr(0, 18)}`,
		});
  };

	const buyTicket = () => {
		console.log('!');
  };

	const sellTicket = () => {
		console.log('!');
  };
	
	const checkIn = () => {
		onRedirect(`/qr/${document.location.pathname.split('/')[2]}`);

		const qr = qrcode(4, 'L');
		qr.addData(`/qr/${document.location.pathname.split('/')[2]}`);
		qr.make();
		setTimeout(() => {
			document.getElementById('qr-code').innerHTML = qr.createImgTag();
		}, 200);
  };

	const onRedirect = (_path) => {
		setRedirect({ status: true, path: _path });
	}

	return (
			<div className='content'>
				<div className='title'>Welcome to Hedera Events</div>
				<Switch>
					{redirect.status === true && (
						<>
							<Redirect to={redirect.path} />
							{setRedirect({ ...redirect, status: false })}
						</>
					)}
					<Route exact path="/">
						<div className='events_list'>
							<div className='event_block'>
								<div className='event_header'>
									<div className='event_title'>New event</div>
									<div className='event_form'>
										<input
											type="text"
											value={eventData.title}
											onChange={(e) => setInput(e, 'title')}
											placeholder="Title"
										/>
										<textarea
											type="text"
											value={eventData.description}
											onChange={(e) => setInput(e, 'description')}
											placeholder="Description"
										/>
										<input
											type="number"
											value={eventData.price}
											onChange={(e) => setInput(e, 'price')}
											placeholder="Price (HBAR)"
										/>
									</div>
									{eventData.link && (
										<div className='event_subtitle'>{`Your event link: ${eventData.link}`}</div>
									)}
								</div>
								<div className='event_bottom'>
									<div className='btn' onClick={createEvent}>Create</div>
								</div>
							</div>
						</div>
					</Route>
					<Route path="/event/:linkId">
						<div className='events_list'>
							<div className='event_block'>
								<div className='event_header'>
									<div className='event_title'>{eventData.title}</div>
									<div className='event_subtitle'>{eventData.description}</div>
									<div className='event_subtitle'>{eventData.price}</div>
								</div>
								<div className='event_bottom'>
									{false ? (
										<>
											<div className='btn' onClick={sellTicket}>Sell</div>
											<div className='btn' onClick={checkIn}>Check in</div>
										</>
									) : (
										<div className='btn' onClick={buyTicket}>Buy</div>
									)}
								</div>
							</div>
						</div>
					</Route>
					<Route path="/qr/:linkId">
						<div className='events_list'>
							<div className='event_block'>
								<div className='event_header'>
									<div className='event_title'>{eventData.title}</div>
									<div className='event_subtitle'>{eventData.description}</div>
									<div className='event_subtitle'>{eventData.price}</div>
								</div>
								<div className='event_bottom'>
									<div id="qr-code" />
								</div>
							</div>
						</div>
					</Route>
					<Redirect to="/" />
				</Switch>
				<div className='copyright'>Hello future</div>
			</div>
	);
};

export default App;
