const fetch = require("node-fetch");

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

const url = "https://realm.mongodb.com/api/client/v2.0/app/petproject-sfwui/graphql"
const otherParam={
    headers: {
        "email": "test@gmail.com",
        "password": "test123",
      },
    body: query,
    method: "POST"
}

async function getWalkerData() {
    const pet_response = await fetch(url, otherParam).then(data=>{return data.json()})//.then(res=>console.log(res));
    console.log(pet_response.data.walks)

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
getWalkerData()
// const final = await getWalkerData()
// console.log(final)