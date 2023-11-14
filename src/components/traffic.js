import { useEffect, useState } from "react";
import Cookies from 'js-cookie';

export const Traffic = () => {
  const [userIp, setUserIp] = useState(null);
  const urlString = window.location.href;
  const paramString = urlString.split('?')[1];
  const queryString = new URLSearchParams(paramString);
  const urlObject = {};

  for (let pair of queryString.entries()) {
    urlObject[pair[0]] = pair[1];
  }

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then((response) => response.json())
      .then((data) => {
        const { ip } = data;
        setUserIp(ip);

        if (!Cookies.get('userCookiee')) {
          const initialUserCookiee = {
            Id: generateUniqueUserID(),
            userIp: ip,
            interactions: [],
            domain: window.location.hostname,
            userAgent: navigator.userAgent,
            trafficSource: urlObject,
          };

          Cookies.set('userCookiee', JSON.stringify(initialUserCookiee), { expires: 365 });
        }
      })
      .catch((error) => {
        console.error('Error fetching IP address:', error);
      });
  }, []);

  const [interactions, setInteractions] = useState([]);

  useEffect(() => {
    if (Cookies.get('userCookiee') !== undefined) {
      const userCookiee = JSON.parse(Cookies.get('userCookiee'));

      if (userCookiee) {
        userCookiee.interactions = interactions;
        Cookies.set('userCookiee', JSON.stringify(userCookiee), { expires: 365 });
      }
    }
  }, [interactions]);

  function generateUniqueUserID() {
    const cookieName = 'uniqueUserID';
    const existingUserID = getCookie(cookieName);

    if (existingUserID) {
      return existingUserID;
    }

    const newUserID = generateRandomUniqueID();
    setCookie(cookieName, newUserID, 365);

    return newUserID;
  }

  function setCookie(name, value, daysToExpire) {
    const date = new Date();
    date.setTime(date.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + date.toUTCString();
    document.cookie = name + '=' + value + '; ' + expires;
  }

  function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1);
      }
    }
    return null;
  }

  function generateRandomUniqueID() {
    const timestamp = new Date().getTime();
    const randomValue = (Math.random() * 2000) + 1;
    const uniqueID = timestamp + '_' + randomValue;
    return uniqueID;
  }

  const sendCookieToServer = () => {
    const userCookiee = Cookies.get('userCookiee');
 
    if (userCookiee) {
      const apiUrl = 'https://webhook.site/d9b8c482-4f29-4a2e-a325-528311d34ba8';
  
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' ,
          
          "Access-Control-Allow-Methods": "*"
        },
        body: JSON.stringify({ userCookiee }),
      })
        .then((response) => {
          if (response.status === 200) {
            return response.text(); // Read the response as text
          } else {
            throw new Error('Server responded with an error: ' + response.status);
          }
        })
   
        .catch((error) => {
         console.error('Error sending user data to the server:', error);
        });
    } else {
      console.warn('User cookie does not exist');
    }
  };
  
  
  
  useEffect(() => {
    sendCookieToServer();
  }, []);

  return null; // Replace with your component's JSX
};
