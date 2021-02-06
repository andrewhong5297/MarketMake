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
    // table header and data here with useState (if columns are static then just define a constant

    const fetchData = async () => {
        // start showing spinner
        setLoading(true);
        try {
        // remote fetch to api even graphql
        const response = await props.onFetchAll()
        console.log(response)
        setData(response);
        } catch (e) {
        setError(e)
        }
        // hide spinner and show error or data
        setLoading(false)
        setError(null)
    }

    useEffect(() => {
    // fetch data
    fetchData()
    }, [])

    const createMapping = () => {
        // const arr = [1,1,2,3,4,5,6]
        // //this is key for getting to totals for each person. Try to get the distance sum first. 
        // console.log(
        //     arr.reduce((sum,d)=>{
        //     return sum + d.Distance_Walked //d is each element of arr
        //     }, 0)
        // ) // sum = 0

        //https://stackoverflow.com/questions/40668896/format-json-data-in-javascript-like-a-pivot-table
        const arr = [{"category":"Amazon","month":"Feb","total":9.75},
        {"category":"Amazon","month":"Mar","total":169.44},
        {"category":"Amazon","month":"Apr","total":10.69},
        {"category":"Amazon","month":"May","total":867.0600000000001},
        {"category":"Amazon","month":"Jun","total":394.43999999999994},
        {"category":"Amazon","month":"Jul","total":787.2400000000001},
        {"category":"Amazon","month":"Aug","total":1112.4400000000003},
        {"category":"Amazon","month":"Sep","total":232.86999999999998},
        {"category":"Amazon","month":"Oct","total":222.26999999999998},
        {"category":"Amazon","month":"Nov","total":306.09999999999997},
        {"category":"Amazon","month":"Dec","total":1096.2599999999998}];

        const o = arr.reduce( (a,b) => {
            a[b.category] = a[b.category] || [];
            a[b.category].push({[b.month]:b.total});
            return a;
        }, {});

        const a = Object.keys(o).map(function(k) {
            return {category : k, month : Object.assign.apply({},o[k])};
        });

        console.log(a);
    }
    
  return (
    <Card>
        <Button onClick={createMapping}>click to sum</Button>
    <Card.Body className="customCard">
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
                                <th>Dog Name</th>
                                <th>Distance Walked</th>
                                <th>Walker Eth Address</th>
                                <th>Walker Name</th>
                            </tr>
                            </thead>
                            {
                            isLoading
                            ? <Spinner animation="border" variant="dark" />
                            : 
                            <tbody>
                                {data.map((row, index) => (
                                    <tr id={index}>
                                        <td id={index}>{row["Dog_Name"]}</td>
                                        <td id={index}>{row["Distance_Walked"]}</td>
                                        <td id={index}><a href={"https://kovan.etherscan.io/address/" + row['Walker_Address']}>{row["Walker_Address"]}</a></td>
                                        <td id={index}>{row["Walker_Name"]}</td>
                                    </tr>
                                ))}
                            </tbody>
                            }
                        </Table>
                        </div>
                    </Tab>
                    <Tab eventKey="times" title="Time Walked" className="tabColor">
                    <div style={{ marginTop: `12px`, overflow: "auto", height: "600px"}} />
                    </Tab>
                    <Tab eventKey="dogs" title="Dogs Walked" className="tabColor">
                    <div style={{ marginTop: `12px`, overflow: "auto", height: "600px"}} />
                    </Tab>
                    <Tab eventKey="contact" title="Badges" className="tabColor">
                    <div style={{ marginTop: `12px`, overflow: "auto", height: "600px"}} />
                        {/* should query all badges and show top levels */}
                    </Tab>
                </Tabs>                    
            </div>
            </div>
        </div>
    </Card.Body>
    </Card>
  )
}