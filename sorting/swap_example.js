
function exchange()
{
	var oTable = document.getElementById('housing_table_1');
	var trs = oTable.tBodies[0].getElementsByTagName("tr");
	var i = document.getElementById('rowi').value;
	var j = document.getElementById('rowj').value;
	
	if(i >= 0 && j >= 0 && i < trs.length && j < trs.length)
	{
		if(i == j+1) {
			oTable.tBodies[0].insertBefore(trs[i], trs[j]);
		} else if(j == i+1) {
			oTable.tBodies[0].insertBefore(trs[j], trs[i]);
		} else {
			var tmpNode = oTable.tBodies[0].replaceChild(trs[i], trs[j]);
			if(typeof(trs[i]) != "undefined") {
				oTable.tBodies[0].insertBefore(tmpNode, trs[i]);
			} else {
				oTable.appendChild(tmpNode);
			}
		}		
	}
	else
	{
		alert("Invalid Values!");
	}
}