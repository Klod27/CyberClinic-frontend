function ComplianceScore({score,passed,failed}){

return(

<div className="score-card">

<h2>Compliance Score</h2>

<h1>{score}%</h1>

<p>Passed: {passed}</p>

<p>Failed: {failed}</p>

</div>

)

}

export default ComplianceScore