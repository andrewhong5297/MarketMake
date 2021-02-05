import React from "react";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";

import {
  Navbar,
  Nav,
  NavDropdown,
  Table,
  Tab,
  Tabs,
  Button,
  Container,
  Row,
  Col,
  Card,
  Dropdown,
  Alert,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { Body, Header, Image, Link } from "./components";
import logo from "./ethereumLogo.png";
import useWeb3Modal from "./hooks/useWeb3Modal";

import { ethers } from "ethers";
import GET_TRANSFERS from "./graphql/subgraph";
import * as Realm from "realm-web";
import { WalkTokenDetails } from "./components/WalkTokenDetails";
import { DataTable } from "./components/DataTable";

const fetch = require("node-fetch");
const { abi: abiWTE } = require("./abis/WalkTokenExchange.json");
const { abi: abiWT } = require("./abis/WalkToken.json");

//https://api.thegraph.com/subgraphs/name/andrewhong5297/walktokentransfers add graphQL query for this later
//https://kovan.etherscan.io/address/0xbe6937c72a622a3d723301036d62d9eb457234b2?fromaddress=0xa55E01a40557fAB9d87F993d8f5344f1b2408072 use this filtering for etherscan linking later
async function getSpecificWalkerData(name) {
  const app = new Realm.App("petproject-sfwui");
  await app.logIn(Realm.Credentials.emailPassword("test@gmail.com", "test123"));
  const url =
    "https://realm.mongodb.com/api/client/v2.0/app/petproject-sfwui/graphql";
  const submittedNameFromContract = "Andrew"; //probably only have to pass address to the contract.
  const query = JSON.stringify({
    query: `
      query {
          walks (query: {Walker_Name: "${name}"}, sortBy: UNIX_TIMESTAMP_DESC) {
              Distance_Walked
              Dog_Name
              Time_Walked
              UNIX_Timestamp
              Walker_Address
              Walker_Name
              _id
          }
        }`,
  });

  const otherParam = {
    headers: {
      Authorization: `Bearer ${app.currentUser.accessToken}`,
    },
    body: query,
    method: "POST",
  };

  const pet_response = await fetch(url, otherParam).then((data) => {
    return data.json();
  }).then(res=>{return res.data.walks});
  return await pet_response;
}

async function getAllWalkerData() {
  const app = new Realm.App("petproject-sfwui");
  await app.logIn(Realm.Credentials.emailPassword("test@gmail.com", "test123"));
  const url =
    "https://realm.mongodb.com/api/client/v2.0/app/petproject-sfwui/graphql";
  const query = JSON.stringify({
    query: `
      query {
          walks (sortBy: UNIX_TIMESTAMP_DESC) {
              Distance_Walked
              Dog_Name
              Time_Walked
              UNIX_Timestamp
              Walker_Address
              Walker_Name
              _id
          }
        }`,
  });

  const otherParam = {
    headers: {
      Authorization: `Bearer ${app.currentUser.accessToken}`,
    },
    body: query,
    method: "POST",
  };

  const pet_response = await fetch(url, otherParam).then((data) => {
    return data.json();
  }).then(res=>{return res.data.walks});
  return await pet_response;
}

function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  return (
    <Button
      style={{ display: "flex", justifyContent: "flex-end" }}
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
      // loginAndFetchWalks();
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
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">Pet NFT</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="https://hack.ethglobal.co/marketmake/teams/rechblh1Znn8U0uzU/recpnc2Ir529X7aJI">
              MarketMake Link
            </Nav.Link>
          </Nav>
          <WalletButton
            provider={provider}
            loadWeb3Modal={loadWeb3Modal}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
          />
        </Navbar.Collapse>
      </Navbar>
      <Container>
        <WalkTokenDetails
          provider={provider}
          walkExchange={walkExchange}
          walkToken={walkToken}
        />
        <DataTable 
          onFetch={()=>getSpecificWalkerData()}
          onFetchAll={()=>getAllWalkerData()}
        />
      </Container>
    </div>
  );
}

export default App;
