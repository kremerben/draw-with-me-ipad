/**
 * Created by winnie on 8/20/14.
 */

$(document).ready(function(){

    var limit = 6;  // grid of 9 images
    var offset = 0; // initial offset upon page load

    function fetchTrending(limit, offset) {
        $.ajax({
            url: '../api/v1/drawing/?limit=' + limit + '&offset=' + offset,
            type: "GET",
            dataType: "json",
            success: function (data) {
                console.log(data);
                for (var i = 0; i < data.objects.length; i++) {
                    var object = data.objects[i];
                    var followers = object.follower;
                    var authors = object.author;
                    var local_path = object.local_path;
                    var title = object.title;
                    var id = object.id;
                    $(".trending-container").append(
                            '<div class="drawing-container drawings" data-img-id="' + id +
                            '" data-img-url="' + local_path + '" data-toggle="modal" data-target="#imageModal">' +
                            '<img class="drawing" src="' + local_path + '" alt="">' +
                            '<h3 class="drawingTitle">' + title + '</h3>' +
                            '<span><b>By:</b> ' + authors + '</span>' +
                            '<span class="pull-right glyphicon glyphicon-heart" style="color:silver"> ' + followers + '</span></div>'
                    );
                }
            },
            error: function (response) {
                console.log(response);
            }
        });
    }

    $(document).on('click', '.trendingBtnClick', function(){
        offset += limit;
        fetchTrending(limit, offset);
    });


    fetchTrending(limit, offset);

});