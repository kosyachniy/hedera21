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
	const [isShowCreateEventTip, setShowCreateEventTip] = useState(false);
	const [eventData, setEventData] = useState({
		title: '',
		count: '',
		price: '',
		owner: '',
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

		const loadUserCredentials = setInterval(() => {
			if (document.getElementById('hedera_mask')) {
				clearInterval(loadUserCredentials);
				const [ accountId, privateKey, extensionId ] = document.getElementById('hedera_mask').className.split(' ')
				setUserCredentials({ accountId, privateKey, extensionId });
			}
		}, 500);
	}, []);

	useEffect(() => {
		if (userCredentials && document.location.pathname.indexOf('event') !== -1) {
			getBalance(userCredentials.accountId).then((tokens) => {
				setUserTokens(JSON.parse(tokens));
			});
		} else if (userCredentials && document.location.pathname.indexOf('qr') !== -1) {
			setTimeout(() => {
				const qr = qrcode(4, 'L');
				qr.addData(`https://testnet.dragonglass.me/hedera/transactions/${document.location.pathname.split('/')[2]}`);
				qr.make();
				document.getElementById('qr-code').innerHTML = qr.createImgTag();
			}, 200);
		}
	}, [userCredentials]);

	const setInput = (e, type) => {
    setEventData({ ...eventData, [type]: e.target.value });
  };

	const createEvent = () => {
		setShowCreateEventTip(true);
		const sendTransaction = setInterval(() => {
			window.chrome.runtime.sendMessage(userCredentials.extensionId, {
	        title: eventData.title,
	        count: eventData.count,
	        priceTicket: eventData.price,
	        from: userCredentials.accountId,
	        to: '0.0.4',
	    }, function(response) {
				if (response) {
					setShowCreateEventTip(false);
					clearInterval(sendTransaction);
					if (response.status === 'success') {
						createToken(eventData.title, eventData.title.substr(0,5).toUpperCase()).then((token) => {
							console.log('!createToken', token);

							eventData.token = token;
							localStorage.setItem('eventData', JSON.stringify(eventData));

							setEventData({
								title: '',
								count: '',
								price: '',
								owner: '',
								link: `${document.location.origin}/event/${eventData.token}`,
							});
						});
					} else {
						console.log('!hederaMaskResponse', response);
					}
				}
	    });
		}, 500);
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
				if (response) {
					setShowBuyTicketTip(false);
					clearInterval(sendTransaction);
					if (response.status === 'success') {
						buyToken(eventData.token, 1, userCredentials.accountId, userCredentials.privateKey).then((res) => {
							console.log('!buyToken', true);
							getBalance(userCredentials.accountId).then((result) => {
								console.log('!getBalance', result);
								setTimeout(() => {
									document.location.reload();
								}, 2000);
							});
						});
					} else {
						console.log('!hederaMaskResponse', response);
					}
				}
	    });
		}, 500);
  };

	const sellTicket = () => {
		console.log('!sellTicket');
  };

	const transferTicket = () => {
		console.log('!transferTicket');
  };

	const checkIn = () => {
		const transactionId = '0.0.10313@1612880079.565634335';
		document.location.href = `${document.location.origin}/qr/${transactionId.replaceAll('.','').replaceAll('@','')}`
  };

	const onRedirect = (_path) => {
		setRedirect({ status: true, path: _path });
	}

	return (
			<div className='content'>
				<Switch>
					{redirect.status === true && (
						<>
							<Redirect to={redirect.path} />
							{setRedirect({ ...redirect, status: false })}
						</>
					)}
					<Route exact path="/">
						<div className='title'>Hedera Smart Tickets</div>
						<div className='subtitle'>Organiser</div>
						<div className='events_list'>
							<div className='event_block'>
								{!eventData.link ? (
									<>
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
														type="number"
														value={eventData.count}
														onChange={(e) => setInput(e, 'count')}
														placeholder="Number of tickets"
													/>
													<input
														type="number"
														value={eventData.price}
														onChange={(e) => setInput(e, 'price')}
														placeholder="Ticket price (HBAR)"
													/>
												</div>
										</div>
										{userCredentials ? (
											<div className='event_bottom'>
												{isShowCreateEventTip ? (
													<div className='event_subtitle' style={{ color: '#3d7eeb' }}>Confirm transaction using HederaMask!</div>
												) : (
													<div className='btn' onClick={createEvent}>Issue tickets</div>
												)}
											</div>
										) : (
											<>
												<div className='event_bottom'>
													<div className='btn btn_disabled' disabled>Issue tickets</div>
												</div>
												<div className='event_subtitle' style={{ color: '#3d7eeb', marginTop: 30 }}>Cannot find HederaMask!</div>
											</>
										)}
									</>
								) : (
									<div className='event_header'>
										<div className='event_title'>Success</div>
										<div className='event_subtitle'>Link to buy tickets:</div>
										<div className='event_subtitle'>{eventData.link}</div>
									</div>
								)}
							</div>
						</div>
					</Route>
					<Route path="/event/:linkId">
						<div className='title'>Hedera Smart Tickets</div>
						{userTokens && Object.keys(userTokens).indexOf(eventData.token) !== -1 ? (
							<div className='subtitle'>Your ticket</div>
						) : (
							<div className='subtitle'>Buy ticket</div>
						)}
						<div className='events_list'>
							<div className='event_block'>
								<div className='event_header'>
									<div className='event_title'>{eventData.title}</div>
									<div className='event_subtitle'>{`${eventData.price} HBAR`}</div>
								</div>
								{userCredentials && userTokens ? (
									<div className='event_bottom'>
										{Object.keys(userTokens).indexOf(eventData.token) !== -1 ? (
											<>
												<div className='btn' onClick={transferTicket}>Transfer</div>
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
									<>
										<div className='event_bottom'>
											<div className='btn btn_disabled' disabled>Buy</div>
										</div>
										<div className='event_subtitle' style={{ color: '#3d7eeb', marginTop: 30 }}>Cannot find HederaMask!</div>
									</>
								)}
							</div>
						</div>
					</Route>
					<Route path="/qr/:linkId">
						<div className='title'>Hedera Smart Tickets</div>
						<div className='subtitle'>Your ticket</div>
						<div className='events_list'>
							<div className='event_block'>
								<div className='event_header'>
									<div className='event_title'>{eventData.title}</div>
								</div>
								<div className='event_bottom'>
									<div className='subtitle'>Show this QR-code to enter</div>
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
