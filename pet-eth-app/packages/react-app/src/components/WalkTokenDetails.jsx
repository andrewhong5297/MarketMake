import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import {
  Container,
  Row,
  Col, 
  Button,
  Tab,
  Tabs,
  Card,
  Table,
  Spinner,
  Alert,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import { RedeemModal } from "./RedeemModal";
import { Marketplace } from "./Marketplace";
import { ethers } from "ethers";

import graybadge from "../images/graybadge.png";
import greenbadge from "../images/greenbadge.png";
import bluebadge from "../images/bluebadge.png";
import purplebadge from "../images/purplebadge.png";
const fetch = require("node-fetch");

//https://api.thegraph.com/subgraphs/name/andrewhong5297/walktokentransfers get actions by address
async function getGraphTransfers(address) {
  const url =
    "https://api.thegraph.com/subgraphs/name/andrewhong5297/walktokentransfers";
  const query = JSON.stringify({
    query: `
      query {
          transfers(orderBy: createdAt, orderDirection: desc, where: {from: "${address.toLowerCase()}"}) {
            id
            from
            action
            value
            createdAt
          }
        }`,
  });

  const otherParam = {
    body: query,
    method: "POST",
  };

  const pet_response = await fetch(url, otherParam).then((data) => {
    return data.json();
  }).then(res=>{return res.data.transfers});
  return await pet_response;
}

const reduceTwoDecimalsBI = (BigIntString) => {
  if(BigIntString.length===1)
  {
    return "0"
  }
  else
  {
  let returnV = BigIntString.slice(0,-16)
  const numberLen = returnV.length
  returnV = returnV.slice(0,numberLen-2) + "." + returnV.slice(numberLen-2,numberLen)
  return returnV
  }
}

const getDateFromUnix = (unix_timestamp) => {
  const date = new Date(unix_timestamp * 1000);
  const formattedTime = (date + " ").slice(0,-33) + " EST" 
  return formattedTime
}

export const WalkTokenDetails = (props) => {
    const [errorPay, setPayError] = useState(null);
    const [errorBadge, setBadgeError] = useState(null);
    const [isBadgeLoading, setBadgeLoading] = useState(false);
    const [isBalanceLoading, setBalanceLoading] = useState(true);
    const [isGraphLoading, setGraphLoading] = useState(true);
    const [isPayLoading, setPayLoading] = useState(false);

    const [datamapped, setMapping] = useState(null)
    const [balance, setBalance] = useState("0");
    const [usdAmount, setUSD] = useState("0");
    const [badgeLevel, setBadgeLevel] = useState("0");
    const [badgeData, setBadgeData] = useState([]);
    const [data, setData] = useState([]);
    const [redeemModalShow, setRedeemModalShow] = useState(false);

    //update all data and table when provider loads in
    useEffect(() => {
      fetchBalance()
      fetchGraphData()
      if(props.provider===undefined){
        setMapping(null)
      }
      else{
        getBadgeLevel();
        setMapping(data.map((row, index) => (
        <tr id={index}>
          <td id={index}>{getDateFromUnix(row["createdAt"])}</td>
          <td id={index}>{row["action"]}</td>
          <td id={index}>{reduceTwoDecimalsBI(row["value"])}</td>
          <td id={index}><a href={"https://kovan.etherscan.io/address/"+props.walkBadge.address+"?fromaddress=" + row["from"]}>{row["id"]}</a></td>
        </tr>
        )))
      }
    }, [props.provider])
    //second useeffect to empty the table
    useEffect(()=>{
      if(props.provider===undefined){
        setMapping(null)
      }
      else{
        setMapping(data.map((row, index) => (
        <tr id={index}>
          <td id={index}>{getDateFromUnix(row["createdAt"])}</td>
          <td id={index}>{row["action"]}</td>
          <td id={index}>{reduceTwoDecimalsBI(row["value"])}</td>
          <td id={index}><a href={"https://kovan.etherscan.io/address/"+props.walkBadge.address+"?fromaddress=" + row["from"]}>{row["id"]}</a></td>
        </tr>
        )))
      }
    }, [data])
    //update USD balance
    useEffect(() => {
      setUSD((parseInt(balance)/100).toString())
    }, [balance])
    
    /*fetching functions*/
    const fetchBalance = async () => {
      setBalanceLoading(true);
      try {          
        const owner = props.provider.getSigner();
        const balance = await props.walkToken.connect(owner).balanceOf(owner.getAddress());
        setBalance(reduceTwoDecimalsBI(balance.toString()));
      } catch (e) {
        }
        setBalanceLoading(false)
    }

    const fetchGraphData = async () => {
      setGraphLoading(true);
      try {          
        const owner = props.provider.getSigner();
        const address = await owner.getAddress()
        const response = await getGraphTransfers(address)
        console.log(response)
        setData(response);
      } catch (e) {
        }
        setGraphLoading(false)
    }

    const checkActionType = () => {
      if(props.provider===undefined || data.length == 0)
      {
        return (<div className="tokenFluctuationUp">0</div>)
      }
      else
      {
        console.log(data)
        if(data[0]["action"]==="Walk Pay") {
        return (<div className="tokenFluctuationUp">{"+" + reduceTwoDecimalsBI(data[0].value)}</div>)
        }
        else {
          return (<div className="tokenFluctuationDown">{"-" + reduceTwoDecimalsBI(data[0].value)}</div>)
        }
      }
    }

    /*rendering functions*/
    const getLevelImg = () => {
      switch(badgeLevel) {
        case "0":
          return (<img style={{height: "65px", width: "65px", justifyContent: "end"}} src={graybadge} />)
          break;
        case "1":
          return (<img style={{height: "65px", width: "65px", justifyContent: "end"}} src={greenbadge} />)
          break;
        case "2":
          return (<img style={{height: "65px", width: "65px", justifyContent: "end"}} src={bluebadge} />)
          break;
        case "3":
          return (<img style={{height: "65px", width: "65px", justifyContent: "end"}} src={purplebadge} />)
          break;        
            }}
    
    const renderTooltip = (props) => (
      <Tooltip id="button-tooltip" {...props}>
        <div>{"Walker Level: "+ badgeData[1]}</div>
        <div>{"Walk Time (min): "+ badgeData[2]/100}</div>
        <div>{"Distance (mi): "+ badgeData[3]/100}</div>
        <div>{"Dogs Walked: "+ badgeData[4]/100}</div>
      </Tooltip>
    );

    const getBadgeLevel= async () => {
      const owner = props.provider.getSigner()
      const address = await owner.getAddress()
      const badgeData = await props.walkBadge.connect(owner).getBadge(address)
      setBadgeLevel(badgeData["level"].toString())
      setBadgeData(badgeData)
    }

    /*transactional functions*/
    const claimPay = async () => {
      const overrides = {
          gasLimit: ethers.BigNumber.from("1000000"),
        };
        
      const owner = props.provider.getSigner();
      try {
          const badge = await props.walkBadge.connect(owner).getBadge(owner.getAddress())
          if (badge[1]==="0")
          {
            setPayError(
              <Alert variant="danger" onClose={() => setPayError(null)} dismissible>
                  <Alert.Heading>Make sure you have already created a badge in the marketplace to register your account</Alert.Heading>
              </Alert>
            )
          }

          else 
          {
            const updatePay = await props.walkBadge.connect(owner).updateWalkerStats(owner.getAddress(), overrides); 
            setPayLoading(true)
            await updatePay.wait(5)
            setPayLoading(false)
            setPayError(
              <Alert variant="success" onClose={() => setPayError(null)} dismissible>
                  <Alert.Heading>Oracle updated your walk stats, walk tokens have been sent!</Alert.Heading>
              </Alert>
            )  
          }   
       }
       catch(e) {
          console.error(e)
          setPayLoading(false)
          setPayError(
                  <Alert variant="danger" onClose={() => setPayError(null)} dismissible>
                      <Alert.Heading>That failed for some reason. Please try again.</Alert.Heading>
                  </Alert>
              ) 
          }
      }
    
    const createUpdateBadge = async () => {
      const overrides = {
        gasLimit: ethers.BigNumber.from("1000000"),
      };
      const owner = props.provider.getSigner();
      const address = await owner.getAddress();
        try {
          if(badgeLevel["level"].toString()=="0") {
          const createBadge = await props.walkBadge.connect(owner).createBadge(address, overrides);
          setBadgeLoading(true)
          await createBadge.wait(2)
        }
        else{
          const updateBadge = await props.walkBadge.connect(owner).updateBadgeLevel(address, overrides);
          setBadgeLoading(true)
          await updateBadge.wait(2)
        }
        setBadgeLoading(false)
        setBadgeError(
          <Alert variant="success" onClose={() => setBadgeError(null)} dismissible>
              <Alert.Heading>Your badge is updated!</Alert.Heading>
          </Alert>
        )  
      }
      catch(e) {
        console.error(e)
        setBadgeLoading(false)
        setBadgeError(
          <Alert variant="danger" onClose={() => setBadgeError(null)} dismissible>
              <Alert.Heading>That failed for some reason. Please try again.</Alert.Heading>
          </Alert>
      ) 
      }
      
    }

  return (
    <div>
      <Card>
        <Card.Body className="customCard">
          <div class="container">
            <div class="row">
              <div class="col-md">
                <Row>
                  <Col>
                    <Card.Title className="customCardTitle">Total Walk Tokens (WT)</Card.Title>
                  </Col>
                </Row>
                
                <div>
                  <Container style={{textAlign: "right"}}>
                    <OverlayTrigger
                      placement="bottom"
                      delay={{ show: 250, hide: 250 }}
                      overlay={renderTooltip}
                    >
                      {getLevelImg()}
                    </OverlayTrigger>,
                  </Container>
                   </div>
                  <Card.Text>
                      {
                        isGraphLoading
                        ? <Spinner animation="border" variant="dark" />
                        : checkActionType()
                      }
                  </Card.Text>
                  <Card.Text className="walkTokenCount">
                      {
                        isBalanceLoading
                        ? <Spinner animation="border" variant="dark" />
                        : 
                        <div>{balance} <span style={{fontSize: 26}}>WT</span></div>
                      }
                  </Card.Text>
                  <Card.Text className="usdConversion">
                      ${usdAmount}
                  </Card.Text>
                <Row>
                  <Col>
                    <Container style={{display: "flex", justifyContent: "center", alignItems: "center" }} React Center>
                        <Button onClick={createUpdateBadge} style = {{fontSize: 14, backgroundColor: "#188120", borderColor: "#188120"}} disabled={isBadgeLoading ? true : false}>
                          { isBadgeLoading
                          ? <Spinner 
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true" />
                          : null
                          } 
                          &nbsp;Create or Update Badge&nbsp;</Button> &nbsp;&nbsp;&nbsp;
                        <Button onClick={claimPay} style = {{fontSize: 14}} variant="primary" disabled={isPayLoading ? true : false}>
                            { isPayLoading
                            ? <Spinner 
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true" />
                            : null
                            } 
                            &nbsp;&nbsp;Claim Walk Tokens&nbsp;&nbsp;</Button> &nbsp;&nbsp;&nbsp;
                        <Button style = {{fontSize: 14}}
                          onClick={() => setRedeemModalShow(true)}
                          variant="secondary"
                        >
                          Redeem Dai (USD)
                        </Button >
                        <RedeemModal
                          show={redeemModalShow}
                          onHide={() => setRedeemModalShow(false)}
                          provider={props.provider}
                          walkExchange={props.walkExchange}
                          walkToken={props.walkToken}
                        />
                    </Container>
                  </Col>
                  {errorBadge}
                  {errorPay}
                </Row>
              </div>

              <div class="col-md">
                  <Tabs className="justify-content-center" defaultActiveKey="Transactions" 
                        id="controlled-tab-example">
                      <Tab eventKey="Transactions" title="Transactions" className="tabColor">
                        <div style={{ marginTop: `12px`, overflow: "auto", height: "280px"}}>
                            <Table striped bordered hover>
                                <thead>
                                  <tr>
                                    <th>Date</th>
                                    <th>Action</th>
                                    <th>Amount (WT)</th>
                                    <th>Etherscan</th>
                                  </tr>
                                </thead>
                                {
                                isGraphLoading
                                ? <Spinner animation="border" variant="dark" />
                                : 
                                <tbody>
                                  {datamapped}  
                                </tbody>
                                }
                            </Table>
                        </div>
                      </Tab>
                      <Tab eventKey="Marketplace" title="Marketplace" className="tabColor">
                        <div style={{ marginTop: `12px`, overflow: "auto", height: "280px"}}>
                        <Marketplace 
                          provider={props.provider}
                          walkExchange={props.walkExchange}
                          walkToken={props.walkToken}
                          walkBadge={props.walkBadge}/>
                        </div>
                      </Tab>
                  </Tabs>                    
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};
