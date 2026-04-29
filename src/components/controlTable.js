function ControlTable({controls}){

return(

<table>

<thead>
<tr>
<th>ID</th>
<th>Control</th>
<th>Status</th>
<th>Severity</th>
<th>Remediation</th>
</tr>
</thead>

<tbody>

{controls.map((c,index)=>(
<tr key={index}>
<td>{c.control_id}</td>
<td>{c.title}</td>
<td>{c.status}</td>
<td>{c.severity}</td>
<td>{c.remediation || "-"}</td>
</tr>
))}

</tbody>

</table>

)

}

export default ControlTable