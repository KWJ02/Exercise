<?

$query = "select * from board_write order by idx desc";
$result = mysqli_query($conect, $query);

while($data = mysqli_fetch_array($result)){
?>        
<tr>
    <td> <?=$data[idx]?> </td>
    <td> <a href="view.php?idx=<?=$data[idx]?>"><?=$data[title]?></a></td>
    <td> <?=$data[name]?> </td>
    <td> <?=$data[date]?> </td>
    <td> <?=$data[views]?> </td>


<?  } ?>