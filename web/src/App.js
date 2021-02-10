import React, { useEffect, useState } from 'react';
import {
    withRouter,
    Route,
    Switch,
    Redirect,
} from 'react-router-dom';
import { server } from './sets.js';
import './App.css';

const qrcode = require('qrcode-generator');
const {
    createToken,
    buyToken,
    burnToken,
    getTokenBalance,
    getToken,
} = require("./hts.js");

const App = () => {
	const [userCredentials, setUserCredentials] = useState(null);
	const [tokenInfo, setTokenInfo] = useState(null);
	const [userTokens, setUserTokens] = useState(null);
	const [isShowBuyTicketTip, setShowBuyTicketTip] = useState(false);
	const [isShowCreateEventTip, setShowCreateEventTip] = useState(false);
	const [isShowCheckInTip, setShowCheckInTip] = useState(false);
	const [eventData, setEventData] = useState({
		title: '',
		count: '',
		price: '',
		link: '',
	});
	const [redirect, setRedirect] = useState({
		status: false,
		path: '/',
	});

	useEffect(() => {
		if (document.location.pathname.indexOf('event') !== -1) {
      getToken(document.location.pathname.split('/')[2]).then((tokenInfoTemp) => {
        if (tokenInfoTemp) {
          console.log('!getToken', tokenInfoTemp);
          tokenInfoTemp.token = document.location.pathname.split('/')[2];
          tokenInfoTemp.price = parseInt(document.location.search.split('hash=')[1], 16);
          setTokenInfo(tokenInfoTemp);
        } else {
          console.log('!getTokenError');
          alert('Token error');
        }
      });
		}

		if (localStorage.getItem('userTokens')) {
			const userTokensTemp = JSON.parse(localStorage.getItem('userTokens'));
			setUserTokens(JSON.parse(userTokensTemp));
		}

		const loadUserCredentials = setInterval(() => {
			if (document.getElementById('hedera_mask')) {
				clearInterval(loadUserCredentials);
				const extensionId = document.getElementById('hedera_mask').className
				setUserCredentials({ extensionId });
			}
		}, 500);
	}, []);

	useEffect(() => {
    if (userCredentials && document.location.pathname.indexOf('qr') !== -1) {
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
	        to: '0.0.4',
	    }, function(response) {
				if (response) {
					setShowCreateEventTip(false);
					clearInterval(sendTransaction);
					if (response.status === 'success') {
						createToken(eventData.title, eventData.title.substr(0,5).toUpperCase()).then((token) => {
							console.log('!createToken', token);

							setEventData({
								title: '',
								count: '',
								price: '',
								link: `${document.location.origin}/event/${token}?hash=${Number(eventData.price).toString(16)}`,
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
	        price: Number(tokenInfo.price),
	        to: tokenInfo.token,
	    }, function(response) {
				if (response) {
					clearInterval(sendTransaction);
					if (response.status === 'success') {
						buyToken(tokenInfo.token, 1, response.accountId, response.privateKey).then((res) => {
							console.log('!buyToken', `https://testnet.dragonglass.me/hedera/transactions/${res.replaceAll('.','').replaceAll('@','')}`);
              setTimeout(() => {
                getTokenBalance(response.accountId).then((result) => {
        					setShowBuyTicketTip(false);
  								console.log('!getTokenBalance', result);

  								setUserTokens(JSON.parse(result));
  								localStorage.setItem('userTokens', JSON.stringify(result));
  							});
              }, 2000);
						});
					} else {
  					setShowBuyTicketTip(false);
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
		setShowCheckInTip(true);
		const sendTransaction = setInterval(() => {
			window.chrome.runtime.sendMessage(userCredentials.extensionId, {
	        price: 0,
	        to: server.accountId,
	    }, function(response) {
				if (response) {
					clearInterval(sendTransaction);
					if (response.status === 'success') {
						burnToken(tokenInfo.token, 1, response.accountId, response.privateKey).then((transactionId) => {
    					setShowCheckInTip(false);
							console.log('!burnToken', transactionId);
          		document.location.href = `${document.location.origin}/qr/${transactionId.replaceAll('.','').replaceAll('@','')}`

              setEventData({
                title: '',
            		count: '',
            		price: '',
            		link: '',
							});

              localStorage.removeItem('userTokens');
						});
					} else {
  					setShowCheckInTip(false);
						console.log('!hederaMaskResponse', response);
					}
				}
	    });
		}, 500);
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
                          <div className='subtitle'>Title</div>
													<input
														type="text"
														value={eventData.title}
														onChange={(e) => setInput(e, 'title')}
                            required
													/>
                          <div className='subtitle'>Number of tickets</div>
													<input
														type="number"
														value={eventData.count}
														onChange={(e) => setInput(e, 'count')}
                            required
													/>
                          <div className='subtitle'>Ticket price (HBAR)</div>
													<input
														type="number"
														value={eventData.price}
														onChange={(e) => setInput(e, 'price')}
                            required
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
										<div className='event_subtitle' style={{ wordBreak: 'break-word' }}>{eventData.link}</div>
									</div>
								)}
							</div>
						</div>
					</Route>
					<Route path="/event/:linkId">
						<div className='title'>Hedera Smart Tickets</div>
						{tokenInfo && userTokens && Object.keys(userTokens).indexOf(tokenInfo.token) !== -1 ? (
							<div className='subtitle'>Your ticket</div>
						) : (
							<div className='subtitle'>Buy ticket</div>
						)}
						<div className='events_list'>
              {tokenInfo && (
  							<div className='event_block'>
  								<div className='event_header'>
  									<div className='event_title'>{tokenInfo.name}</div>
  									<div className='event_subtitle'>{`${tokenInfo.price} HBAR`}</div>
  								</div>
  								{userCredentials ? (
  									<>
  										{userTokens && Object.keys(userTokens).indexOf(tokenInfo.token) !== -1 ? (
  											<div className='event_bottom'>
  												{isShowCheckInTip ? (
  													<div className='event_subtitle' style={{ color: '#3d7eeb' }}>Confirm transaction using HederaMask!</div>
  												) : (
                            <>
    													<div className='btn' onClick={transferTicket}>Transfer</div>
    													<div className='btn' onClick={sellTicket}>Sell</div>
    												  <div className='btn' onClick={checkIn}>Check in</div>
                            </>
  												)}
  											</div>
  										) : (
  											<div className='event_bottom'>
  												{isShowBuyTicketTip ? (
  													<div className='event_subtitle' style={{ color: '#3d7eeb' }}>Confirm transaction using HederaMask!</div>
  												) : (
  													<div className='btn' onClick={buyTicket}>Buy</div>
  												)}
  											</div>
  										)}
  									</>
  								) : (
  									<>
  										<div className='event_bottom'>
  											<div className='btn btn_disabled' disabled>Buy</div>
  										</div>
  										<div className='event_subtitle' style={{ color: '#3d7eeb', marginTop: 30 }}>Cannot find HederaMask!</div>
  									</>
  								)}
  							</div>
              )}
						</div>
					</Route>
					<Route path="/qr/:linkId">
						<div className='title'>Hedera Smart Tickets</div>
						<div className='subtitle'>Your ticket</div>
						<div className='events_list'>
							<div className='event_block'>
								<div className='event_header'>
									<div className='subtitle'>Show this QR-code to enter</div>
								</div>
								<div className='event_bottom'>
									<div id="qr-code" />
                  <div className='subtitle' style={{ wordBreak: 'break-word', margin: 10 }}>
                    {`https://testnet.dragonglass.me/hedera/transactions/${document.location.pathname.split('/')[2]}`}
                  </div>
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
