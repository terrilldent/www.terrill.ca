<?php
include_once 'write/data/auth/util.php';
include_once 'write/data/posts.php';
$postID = preg_replace( "/[^0-9a-z_-]/", "", $_GET[ 'id' ] );
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title><?= outputPostTitle($postID) ?> - Terrill Dent</title>
<link rel="stylesheet" href="/style.css" />
<meta name="viewport" content="width=device-width">
</head>
<body>

<div class="content">
	<div class="header">
        <h1><a href="/">Terrill Dent</a></h1>
		<div class="nav-content">
            <a class="nav-link current" href="/">Blog</a>
            <a class="nav-link" href="/about/">About</a>
            <a class="nav-link" href="/projects/">Projects</a>
			<a class="nav-link" href="/illustrations/">Illustrations</a>
		</div>
	</div>
<?php
outputPost( $postID );
?>
</div>

<script async src="/mint/?js" type="text/javascript"></script>
</body>
</html>