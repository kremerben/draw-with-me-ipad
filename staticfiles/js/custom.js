$(document).ready(function(){
//    $.ajax({
//        url: "url",
//        type: "GET",
//        dataType: "json",
//        success: function(response) {
//            console.log(response);
//        }
//    });
    $(document).on('click', '.drawing-container', function(){
        imageURL = ($(this).attr('data-img-url'));
        var drawingTitle = $(this).children('.drawingTitle').text();
        var drawingId = $(this).attr('data-img-id');
        var thisImage = $(this);

        if ($(this).hasClass("myDrawings")){
           $('#unFavoriteImage').hide();
           $('#addFavorite').hide();
        }
        else if ($(this).hasClass("favorites")){
            $('#removeAuthor').hide();
            $('#addFavorite').hide();
        }
        else {
           $('#unFavoriteImage').hide();
           $('#removeAuthor').hide();
        }

        $('.modal-body').children().attr('src', $(this).attr('data-img-url'));
        $('.modal-title').text(drawingTitle);

        // Button actions
        $('#editImage').attr('href', '../canvas/' + drawingId);
        $('#downloadImage').attr('href', imageURL);
        $('#unFavoriteImage').on('click', function(){
            unfavorite(drawingId);
            thisImage.hide('slow');
        });
        $('#removeAuthor').on('click', function(){
            remove_author(drawingId);
            thisImage.hide('slow');
        });
        $('#addFavorite').on('click', function(){
            add_favorite(drawingId);
        });

    });

    function add_favorite(drawingId){
        imageInfo = {};
        imageInfo.drawingId = drawingId;
        imageInfo = JSON.stringify(imageInfo);
        $.ajax({
            url: "/add_favorite/",
            type: "POST",
            dataType: 'html',
            data: imageInfo,
            success: function(response) {
                console.log("add favorite!");
                console.log(response);
            },
            error: function(response) {
                console.log(response);
            }
        });
    }

    function unfavorite(drawingId){
        imageInfo = {};
        imageInfo.drawingId = drawingId;
        imageInfo = JSON.stringify(imageInfo);
        $.ajax({
            url: "/unfavorite/",
            type: "POST",
            dataType: 'html',
            data: imageInfo,
            success: function(response) {
                console.log("unfavorited!");
                console.log(response);
            },
            error: function(response) {
                console.log(response);
            }
        });
    }

    function remove_author(drawingId){
        imageInfo = {};
        imageInfo.drawingId = drawingId;
        imageInfo = JSON.stringify(imageInfo);
        $.ajax({
            url: "/remove_author/",
            type: "POST",
            dataType: 'html',
            data: imageInfo,
            success: function(response) {
                console.log("Author Removed!");
                console.log(response);
            },
            error: function(response) {
                console.log(response);
            }
        });
    }
});


