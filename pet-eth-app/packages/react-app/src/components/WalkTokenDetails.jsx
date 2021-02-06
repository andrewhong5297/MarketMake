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
  Alert
} from "react-bootstrap";
import { RedeemModal } from "./RedeemModal";
import { Marketplace } from "./Marketplace";
import { ethers } from "ethers";
const fetch = require("node-fetch");

//https://api.thegraph.com/subgraphs/name/andrewhong5297/walktokentransfers get actions by address
async function getGraphTransfers(address) {
  const url =
    "https://api.thegraph.com/subgraphs/name/andrewhong5297/walktokentransfers";
  const query = JSON.stringify({
    query: `
      query {
          transfers(where: {from: "${address.toLowerCase()}"}) {
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

export const WalkTokenDetails = (props) => {
    const [errorBadge, setBadgeError] = useState(null);
    const [isBalanceLoading, setBalanceLoading] = useState(true);
    const [isGraphLoading, setGraphLoading] = useState(true);
    const [isPayLoading, setPayLoading] = useState(false);

    const [balance, setBalance] = useState("0");
    const [usdAmount, setUSD] = useState("0");
    const [data, setData] = useState([]);
    const [redeemModalShow, setRedeemModalShow] = useState(false);

    const reduceTwoDecimalsBI = (BigIntString) => {
      if(BigIntString.length==1)
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
        const response = await getGraphTransfers("0xa55E01a40557fAB9d87F993d8f5344f1b2408072")
        console.log(response)
        setData(response);
      } catch (e) {
        }
        setGraphLoading(false)
    }

    const checkActionType = () => {if(data[data.length-1]["action"]=="Walk Pay") {
      return (<div className="tokenFluctuationUp">{"+" + reduceTwoDecimalsBI(data[data.length-1].value)}</div>)
    }
    else {
      return (<div className="tokenFluctuationDown">{"-" + reduceTwoDecimalsBI(data[data.length-1].value)}</div>)
    }}

    //update all data when provider loads in
    useEffect(() => {
    fetchBalance()
    fetchGraphData()
    }, [props.provider])

    //update USD balance
    useEffect(() => {
      setUSD((parseInt(balance)/100).toString())
    }, [balance])

    //claim pay button
    const claimPay = async (formData) => {
      const overrides = {
          gasLimit: ethers.BigNumber.from("1000000"),
        };
        
      const owner = props.provider.getSigner();
      try {
          const badge = await props.walkBadge.connect(owner).getBadge(owner.getAddress())
          if (badge[1]=="0")
          {
            setBadgeError(
              <Alert variant="danger" onClose={() => setBadgeError(null)} dismissible>
                  <Alert.Heading>Make sure you have already created a badge in the marketplace to register your account</Alert.Heading>
              </Alert>
            )
          }

          else 
          {
            const updatePay = await props.walkBadge.connect(owner).createBadge(owner.getAddress(), overrides); 
            setPayLoading(true)
            await updatePay.wait(5)
            setPayLoading(false)
            setBadgeError(
              <Alert variant="success" onClose={() => setBadgeError(null)} dismissible>
                  <Alert.Heading>Oracle updated your walk stats, walk tokens have been sent!</Alert.Heading>
              </Alert>
            )  
          }   
       }
       catch(e) {
          console.error(e)
          setPayLoading(false)
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
                        <div>{balance} WT</div>
                      }
                  </Card.Text>
                  <Card.Text className="usdConversion">
                      ${usdAmount}
                  </Card.Text>
                <Row>
                  <Col>
                    <Container style={{display: "flex", justifyContent: "center", alignItems: "center" }} React Center>
                        <Button onClick={claimPay} style = {{fontSize: 14}} disabled={isPayLoading ? true : false}>
                            { isPayLoading
                            ? <Spinner 
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true" />
                            : null
                            } 
                            &nbsp;&nbsp;Claim Tokens&nbsp;&nbsp;</Button> &nbsp;&nbsp;&nbsp;
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
                </Row>
              </div>

              <div class="col-md">
                  <Tabs className="justify-content-center" defaultActiveKey="Transactions" 
                        id="controlled-tab-example">
                      <Tab eventKey="Transactions" title="Transactions" className="tabColor">
                        <div style={{ marginTop: `12px`, overflow: "auto", height: "250px"}}>
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
                                  {data.map((row, index) => (
                                  <tr id={index}>
                                    <td id={index}>{getDateFromUnix(row["createdAt"])}</td>
                                    <td id={index}>{row["action"]}</td>
                                    <td id={index}>{reduceTwoDecimalsBI(row["value"])}</td>
                                    <td id={index}><a href={"https://kovan.etherscan.io/address/0x649c200de35dc9990db3ac49ac8ed2237053aa35?fromaddress=" + row["from"]}>{row["id"]}</a></td>
                                  </tr>
                              ))}
                              </tbody>
                                }
                            </Table>
                        </div>
                      </Tab>
                      <Tab eventKey="Marketplace" title="Marketplace" className="tabColor">
                          <Marketplace 
                          provider={props.provider}
                          walkExchange={props.walkExchange}
                          walkToken={props.walkToken}/>
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
