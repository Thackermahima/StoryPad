import React,{ useEffect, useState} from 'react'
import { api, utils } from "@epnsproject/frontend-sdk-staging";
import { NotificationItem } from  "@epnsproject/frontend-sdk-staging";
import { useMoralis, useMoralisQuery } from "react-moralis";

const FetchNotification = () => {
   const[notifications, setNotifications] = useState([])
  // const nftMetadata = Moralis.Object.extend("nftMetadata");


    useEffect(()=>{
       async function fetchNotifications(){
        const walletAddress = localStorage.getItem("currentUserAddress");
        const pageNumber = 1;
        const itemsPerPage = 20;
        const { count, results } = await api.fetchSpamNotifications(walletAddress, itemsPerPage, pageNumber)
        console.log(results,"results");
       let parsedResponse = utils.parseApiResponse(results);
        console.log(parsedResponse, "parsedResponse");
        setNotifications(parsedResponse);
       }
       fetchNotifications()
       
    },[])

  return (
<div style={{ marginTop:'8%'}}>
{notifications.map((obj) => {
   console.log(obj.title, "obj")
   return (
      
<div>

   <NotificationItem
		notificationTitle={obj.title}
		notificationBody={obj.message}
		cta={obj.cta}
		app={obj.app}
		icon={obj.icon}
		image={obj.image}
	/>
   </div>


   )
})
}
</div>
    )
}

export default FetchNotification