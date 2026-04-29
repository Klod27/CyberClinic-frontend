import React, { useState } from "react"
import { runComplianceScan } from "./api"
import ComplianceScore from "./components/ComplianceScore"
import ControlTable from "./components/ControlTable"

function Dashboard(){

const [loading,setLoading] = useState(false)
const [results,setResults] = useState(null)

const startScan = async () => {

  setLoading(true)

  try {

    const data = await runComplianceScan()

    setResults(data)

  } catch(e){
    console.error(e)
  }

  setLoading(false)
}

return(

<div>

<h1>CyberClinic Risk & Compliance</h1>

<button onClick={startScan}>
Run Compliance Scan
</button>

{loading && <p>Running compliance scan...</p>}

{results && (

<>
<ComplianceScore score={results.score} passed={results.passed} failed={results.failed} />

<ControlTable controls={results.controls}/>
</>

)}

</div>

)

}

export default Dashboard