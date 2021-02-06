import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import {
  Row,
  Col,
  Button,
  Tab,
} from "react-bootstrap";
import { ethers } from "ethers";

export const Marketplace = (props) => {

    return (
            <div style={{ marginTop: `12px` }}>
                <Button>buy things</Button>
                <Button>redeem new Badge</Button>
            </div>
    )}