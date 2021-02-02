import React from "react";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";

import { Table, Button, Container, Row, Col, Card, Dropdown, Alert } from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.min.css';

import { Body, Header, Image, Link } from "./components";
import logo from "./ethereumLogo.png";
import useWeb3Modal from "./hooks/useWeb3Modal";

import { ethers } from "ethers";
import { useForm } from "react-hook-form";
import { addresses, abis } from "@project/contracts";
import GET_TRANSFERS from "./graphql/subgraph";
import * as Realm from "realm-web";
import { RedeemButton } from "./components/RedeemButton";

const fetch = require("node-fetch");
const { abi: abiWTE } = require("./abis/WalkTokenExchange.json");
const { abi: abiWT } = require("./abis/WalkToken.json");

async function getWalkerData(token) {
  const url = "https://realm.mongodb.com/api/client/v2.0/app/petproject-sfwui/graphql"
  const submittedNameFromContract = "Andrew" //probably only have to pass address to the contract.
  const query =JSON.stringify({query: `
      query {
          walks (query: {Walker_Name: "${submittedNameFromContract}"}, sortBy: TIME_WALKED_ASC) {
              Distance_Walked
              Dog_Name
              Time_Walked
              UNIX_Timestamp
              Walker_Address
              Walker_Name
              _id
          }
        }`
  })

  const otherParam={
    headers: {
      "Authorization": `Bearer ${token}`
    },
      body: query,
      method: "POST"
  }

    const pet_response = await fetch(url, otherParam).then(data=>{return data.json()})//.then(res=>console.log(res));

    const walkSum = pet_response.data.walks.reduce((sum,d) => {
        return sum + d.Time_Walked
      }, 0)
    
      const distanceSum = pet_response.data.walks.reduce((sum,d) => {
        return sum + d.Distance_Walked
      }, 0)
    
      const dogCountSum = pet_response.data.walks.reduce((sum) => {
        return sum + 1
      }, 0)
      
      //this one is probably its own API response, which checks UNIX time over last week. So query UNIX larger than the [block.timestamp - 604800] (seconds in a week)
      //maybe these should be a batch API call? Since payments should only be once a week. But badge requests could be anytime? 
      const totalPaymentsDue = pet_response.data.walks.reduce((sum,d) => {
        return sum + (d.Distance_Walked*d.Time_Walked)
      }, 0)
    
      const name = pet_response.data.walks[0].Walker_Name
      const finalResponse = [name,walkSum,distanceSum,dogCountSum,totalPaymentsDue]

    console.log(finalResponse)
    return finalResponse
}

const loginAndFetchWalks = async () => {
  const app = new Realm.App("petproject-sfwui")
  await app.logIn(Realm.Credentials.emailPassword("test@gmail.com", "test123"));
  await getWalkerData(app.currentUser.accessToken);
};

function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!provider ? "Connect Wallet" : "Disconnect Wallet"}
    </Button>
  );
}

////to-do list for marketmake
//function to redeem badge
//function to redeem real monies
//function to buy NFT (dog toy)
//function to show rankings of walkers
//query to show most recent walks... insert data that multiplies? or just do that post response
function App() {
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();

  React.useEffect(() => {
    if (!loading && !error && data && data.transfers) {
      console.log({ transfers: data.transfers });
      loginAndFetchWalks(); 
    }
  }, [loading, error, data]);

  //contracts
  let walkExchange = new ethers.Contract(
    "0x226AD4B41EC8cfe8157d095DCd382614bFBE2037",
    abiWTE,
    provider
  );

  let walkToken = new ethers.Contract(
    "0x13e5Cc4beAF377BcC4318A6AB3698CE846f4FA85",
    abiWT,
    provider
  );

  return (
    <div> 
        <Header>
          <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
        </Header>
          <Body>
            <Image src={logo} alt="react-logo" />
            <p>
              Edit <code>packages/react-app/src/App.js</code> and save to reload.
            </p>
            <RedeemButton 
              provider={provider}
              walkExchange={walkExchange}
              walkToken={walkToken} />
            <Link href="https://ethereum.org/developers/#getting-started" style={{ marginTop: "8px" }}>
              Learn Ethereum
            </Link>
            <Link href="https://reactjs.org">Learn React</Link>
            <Link href="https://thegraph.com/docs/quick-start">Learn The Graph</Link>
        </Body>
    </div>
  );
}

export default App;
