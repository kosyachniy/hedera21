import React, { useEffect, useState } from 'react';
import {
	withRouter, Route, Switch, Redirect,
} from 'react-router-dom';
import './App.css';

const qrcode = require('qrcode-generator');
const { createToken, buyToken, getBalance } = require("./hts.js");

const App = () => {
	const [userCredentials, setUserCredentials] = useState(null);
	const [userTokens, setUserTokens] = useState(null);
	const [isShowBuyTicketTip, setShowBuyTicketTip] = useState(false);
	const [eventData, setEventData] = useState({
		title: '',
		tokenName: '',
		description: '',
		count: '',
		price: '',
		owner: '0.0.10315',
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

			const loadUserCredentials = setInterval(() => {
				if (document.getElementById('hedera_mask')) {
					clearInterval(loadUserCredentials);
					const [ accountId, privateKey, extensionId ] = document.getElementById('hedera_mask').className.split(' ')
					setUserCredentials({ accountId, privateKey, extensionId });
				}
			}, 500);
		}
	}, []);

	useEffect(() => {
		if (userCredentials && document.location.pathname.indexOf('event') !== -1) {
			getBalance(userCredentials.accountId).then((tokens) => {
				setUserTokens(JSON.parse(tokens));
			});
		} else if (userCredentials && document.location.pathname.indexOf('qr') !== -1) {
			setTimeout(() => {
				const qr = qrcode(4, 'L');
				qr.addData(`/qr/${document.location.pathname.split('/')[2]}`);
				qr.make();
				document.getElementById('qr-code').innerHTML = qr.createImgTag();
			}, 200);
		}
	}, [userCredentials]);

	const setInput = (e, type) => {
    setEventData({ ...eventData, [type]: e.target.value });
  };

	const createEvent = () => {
		createToken(eventData.title, eventData.tokenName.toUpperCase()).then((token) => {
			console.log('!createToken', true, token);

			eventData.token = token
			localStorage.setItem('eventData', JSON.stringify(eventData));

			setEventData({
				title: '',
				tokenName: '',
				description: '',
				count: '',
				price: '',
				owner: '0.0.10315',
				link: `${document.location.origin}/event/${eventData.tokenName.toUpperCase()}`,
			});
		});
  };

	const buyTicket = () => {
		setShowBuyTicketTip(true);
		const sendTransaction = setInterval(() => {
			window.chrome.runtime.sendMessage(userCredentials.extensionId, {
	        price: Number(eventData.price),
	        token: eventData.token,
	        from: userCredentials.accountId,
	        to: eventData.owner,
	    }, function(response) {
	        if (response && response.status === 'success') {
						clearInterval(sendTransaction);

						setTimeout(() => {
							setShowBuyTicketTip(false);
							buyToken(eventData.token, 1, userCredentials.accountId, userCredentials.privateKey).then((res) => {
								console.log('!buyToken', true);
								getBalance(userCredentials.accountId).then((result) => {
									console.log('!getBalance', result);
									setTimeout(() => {
										document.location.reload();
									}, 2000);
								});
							});
						}, 7000);
					}
	    });
		}, 500);
  };

	const sellTicket = () => {
		console.log('!');
  };

	const checkIn = () => {
		document.location.href = `${document.location.origin}/qr/${document.location.pathname.split('/')[2]}`
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
										<input
											type="text"
											value={eventData.tokenName}
											onChange={(e) => setInput(e, 'tokenName')}
											placeholder="Short name"
											maxLength="5"
										/>
										<textarea
											type="text"
											value={eventData.description}
											onChange={(e) => setInput(e, 'description')}
											placeholder="Description"
										/>
										<input
											type="number"
											value={eventData.count}
											onChange={(e) => setInput(e, 'count')}
											placeholder="Number of tickets"
										/>
										<input
											type="number"
											value={eventData.price}
											onChange={(e) => setInput(e, 'price')}
											placeholder="Price"
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
								{userCredentials && userTokens ? (
									<div className='event_bottom'>
										{Object.keys(userTokens).indexOf(eventData.token) !== -1 ? (
											<>
												<div className='btn' onClick={sellTicket}>Sell</div>
												<div className='btn' onClick={checkIn}>Check in</div>
											</>
										) : (
											<>
												{isShowBuyTicketTip ? (
													<div className='event_subtitle' style={{ color: '#3d7eeb' }}>Confirm transaction using HederaMask!</div>
												) : (
													<div className='btn' onClick={buyTicket}>Buy</div>
												)}
											</>
										)}
									</div>
								) : (
									<div className='event_bottom'>
										<div className='btn btn_disabled' disabled>Buy</div>
									</div>
								)}
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
