import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import {
  Tab,
  Tabs,
  Card,
  Table,
  Spinner,
  Button
} from "react-bootstrap";

//should we keep a most recent walks tab? then a seperate leaderboard tab?
export const RankingDataTable = (props) => {
    const [error, setError] = useState(null)
    const [isLoading, setLoading] = useState(true)
    const [data, setData] = useState();

    const[distanceData,setDisData] = useState([]);
    const[timeData,setTimeData] = useState([]);
    const[dogsData,setDogsData] = useState([]);
    // table header and data here with useState (if columns are static then just define a constant

    const fetchData = async () => {
        // start showing spinner
        setLoading(true);
        try {
        // remote fetch to api even graphql
        const response = await props.onFetchAll()
        // console.log(response)
        setData(response);
        } catch (e) {
        setError(e)
        }
        // hide spinner and show error or data
        setLoading(false)
        setError(null)
    }

    useEffect(() => {
    fetchData()
    }, [])

    useEffect(() => {
        if(data!=undefined){
            setDisData(createMapping("Distance_Walked"))
            setTimeData(createMapping("Time_Walked"))
            setDogsData(createMapping("Dog_Name"))
        }
    },[isLoading])

    const createMapping = (field) => {
        //dog name is special since it is count instead of sum
        if(field==="Dog_Name")
        {
            const result = data.reduce((res, obj) => {
                if (!(obj.Walker_Address in res))
                {
                     res.__array.push(res[obj.Walker_Address] = obj);
                     res[obj.Walker_Address]["Dog_Name"]=1;
                }
                else {
                    res[obj.Walker_Address]["Dog_Name"] += 1;
                }
                return res;
            }, {__array:[]}).__array
                            .sort((a,b) => { return b["Dog_Name"] - a["Dog_Name"]; });
            return result
        }

        //https://stackoverflow.com/questions/11199653/javascript-sum-and-group-by-of-json-data
        const result = data.reduce((res, obj) => {
            if (!(obj.Walker_Address in res))
                res.__array.push(res[obj.Walker_Address] = obj);
            else {
                res[obj.Walker_Address][field] += obj[field];
            }
            return res;
        }, {__array:[]}).__array
                        .sort((a,b) => { return b[field] - a[field]; });
        return result
    }
    
  return (
    <Card>
        <Card.Body className="secondCustomCard">
        <Card.Title className="customCardTitle">Walker Rankings Based on Lifetime Totals</Card.Title>
            <div class="container">
                <div class="row">
                <div class="col-md">
                    <Tabs className="justify-content-center" defaultActiveKey="distances" 
                            id="controlled-tab-example">
                        <Tab eventKey="distances" title="Distance Walked" className="tabColor">
                            <div style={{ marginTop: `12px`, overflow: "auto", height: "600px"}}>
                            <Table striped bordered hover>
                                <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Walker Name</th>
                                    <th>Walker Eth Address</th>
                                    <th>Distance Walked (Miles)</th>
                                </tr>
                                </thead>
                                {
                                isLoading
                                ? <Spinner animation="border" variant="dark" />
                                : 
                                <tbody>
                                    {distanceData.map((row, index) => (
                                        <tr id={index}>
                                            <td id={index}>{index+1}</td>
                                            <td id={index}>{row["Walker_Name"]}</td>
                                            <td id={index}><a href={"https://kovan.etherscan.io/address/" + row['Walker_Address']}>{row["Walker_Address"]}</a></td>
                                            <td id={index}>{parseFloat(row["Distance_Walked"]).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                }
                            </Table>
                            </div>
                        </Tab>
                        <Tab eventKey="times" title="Time Walked" className="tabColor">
                        <div style={{ marginTop: `12px`, overflow: "auto", height: "600px"}}>
                            <Table striped bordered hover>
                                <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Walker Name</th>
                                    <th>Walker Eth Address</th>
                                    <th>Time Walked (Minutes)</th>
                                </tr>
                                </thead>
                                {
                                isLoading
                                ? <Spinner animation="border" variant="dark" />
                                : 
                                <tbody>
                                    {timeData.map((row, index) => (
                                        <tr id={index}>
                                            <td id={index}>{index+1}</td>
                                            <td id={index}>{row["Walker_Name"]}</td>
                                            <td id={index}><a href={"https://kovan.etherscan.io/address/" + row['Walker_Address']}>{row["Walker_Address"]}</a></td>
                                            <td id={index}>{parseInt(row["Time_Walked"])}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                }
                            </Table>
                            </div>
                        </Tab>
                        <Tab eventKey="dogs" title="Dogs Walked" className="tabColor">
                        <div style={{ marginTop: `12px`, overflow: "auto", height: "600px"}}>
                            <Table striped bordered hover>
                                <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Walker Name</th>
                                    <th>Walker Eth Address</th>
                                    <th># Dogs Walked</th>
                                </tr>
                                </thead>
                                {
                                isLoading
                                ? <Spinner animation="border" variant="dark" />
                                : 
                                <tbody>
                                    {dogsData.map((row, index) => (
                                        <tr id={index}>
                                            <td id={index}>{index+1}</td>
                                            <td id={index}>{row["Walker_Name"]}</td>
                                            <td id={index}><a href={"https://kovan.etherscan.io/address/" + row['Walker_Address']}>{row["Walker_Address"]}</a></td>
                                            <td id={index}>{row["Dog_Name"]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                }
                            </Table>
                            </div>
                        </Tab>
                    </Tabs>                    
                </div>
                </div>
            </div>
        </Card.Body>
    </Card>
  )
}