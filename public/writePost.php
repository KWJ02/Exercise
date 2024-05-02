<?
    include "lib.php";

    $title = $_POST['title'];
    $content = $_POST['content'];

    $title = mysqli_real_escape_string($connect, $title);
    $content = mysqli_real_escape_string($connect, $content);

   $date = date("Y-m-d H:i:s");

   $qurey = "insert into board_write(title, name, date, views)
        values('$title', '$name', '$date', '$views')";

        mysqli_query($connect, $query);

?>

<script>
    location.href='community.html';
</script>




