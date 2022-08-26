import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useMoralis } from "react-moralis";
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js'
import { useParams } from 'react-router-dom';
import { ethers } from "ethers";
import ChildContractAbi from "../../abi/mintContract.json"
import web3 from "web3";


export default function ModalContribute(props) {
  const { Moralis } = useMoralis();
  console.log(props.e.tokAdd, 'e in Modal')
  const params = useParams();

  const API_Token = process.env.REACT_APP_WEB3STORAGE_TOKEN;
  const client = new Web3Storage({ token: API_Token })
  const [userAccount, setUserAccount] = useState([]);

  const reviews = Moralis.Object.extend("Reviews");

  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  function PriceSet() {
    setPrice(props.e.element.Nonholder_price)
  }
  console.log(props.e.tokAdd,'token------');
  // console.log(props.e.walletAddress,'wallet add----');
  console.log(localStorage.getItem("currentUserAddress"),'current user');
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
    PriceSet();
  };
  const handleClose = () => {
    setOpen(false);
  };

  async function onAddClick(e) {
    e.preventDefault();
    setLoading(true)
    let transaction = await TransferEth();

    if (transaction) {
      setLoading(false);
      setOpen(false)
    }
  }

  const TransferEth = async () => {
    await Moralis.enableWeb3();
    const options = {
      type: "native",
      amount: Moralis.Units.ETH(price, "18"),
      receiver: props.e.walletAddress,
      contractAddress: "0x0000000000000000000000000000000000001010",
    }
    let result = await Moralis.transfer(options);
    let tx = result.wait();
    console.log(tx,'tx -----');
    return tx;

  }


  const Web3 = require('web3');
  const web3 = new Web3(new Web3.providers.HttpProvider('https://polygon-mumbai.g.alchemy.com/v2/Z73LIdldZrZCX8ikHvp9zS0T2Vbx73MR'));
  
  // Define the ERC-20 token contract
  const contract = new web3.eth.Contract(ChildContractAbi.abi, props.e.tokAdd)
  
  async function getTokenBalance() {
      // Execute balanceOf() to retrieve the token balance
      const result = await contract.methods.balanceOf(localStorage.getItem("currentUserAddress")).call(); // 29803630997051883414242659
      console.log(result,'result----');
      // Convert the value from Wei to Ether
      const formattedResult = web3.utils.fromWei(result, "ether"); // 29803630.997051883414242659
  
      console.log(formattedResult);
  }
  

  return (
    <div style={{ display: "contents" }}>
      <button type="button" onClick={() => {
        handleClickOpen();
        getTokenBalance();
      }} class="btn btn-outline-danger buy-story-btn">Buy Story</button>

      <Dialog style={{ widht: "400px" }} open={open} onClose={handleClose}>
        <DialogTitle>Buy Story</DialogTitle>
        <div className='dialogUnderline'></div>
        <DialogContent>
          <h3>
            Your Price
          </h3>

          <TextField
            autoFocus
            disabled
            value={price}
            margin="dense"
            className="ETH-amount"
            label="MATIC"
            type="number"
            fullWidth
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button onClick={onAddClick} disabled={loading}> {loading ? "Loading...." : "Pay"} </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}