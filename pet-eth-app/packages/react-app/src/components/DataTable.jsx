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
  Modal,
} from "react-bootstrap";

export const DataTable = (props) => {
    const [data, setData] = useState("Hello");
    const [table , setTable] = useState(
    <div>
        <Table striped bordered hover>
            <thead>
            <tr>
                <th>null</th>
                <th>null</th>
                <th>null</th>
                <th>null</th>
            </tr>
            </thead>
        </Table>
    </div>)

    const updateData = async () => {
        const newData = await props.onFetch();
        setData(newData);
    }

    useEffect(() => {
        setTable(
            <div>
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>{data[0]["Dog_Name"]}</th>
                        <th>{data[0]["Distance_Walked"]}</th>
                        <th>{data[0]["Time_Walked"]}</th>
                        <th>{data[0]["Walker_Name"]}</th>
                    </tr>
                    </thead>
                </Table>
            </div>)
      }, [data]);
    
  return (
    <Card>
    <Card.Body>
    {table}
    <Button onClick={updateData}>update data</Button>
    <div class="container">
        <div class="row">
        <div class="col-md">
            <Tabs className="justify-content-center" defaultActiveKey="Home" 
                    id="controlled-tab-example">
                <Tab eventKey="Home" title="Distance Walked">
                    <div style={{ marginTop: `12px` }}>
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Username</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>1</td>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Jacob</td>
                                <td>Thornton</td>
                                <td>@fat</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td colSpan="2">Larry the Bird</td>
                                <td>@twitter</td>
                            </tr>
                            </tbody>
                        </Table>
                    </div>
                </Tab>
                <Tab eventKey="profile" title="Profile">
                </Tab>
                <Tab eventKey="contact" title="Contact">
                </Tab>
                <Tab eventKey="contact" title="Y33t">
                </Tab>
            </Tabs>                    
        </div>
        </div>
    </div>
    </Card.Body>
    </Card>
  )
}