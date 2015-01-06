require.config({
    paths: {
        jquery: 'libs/jquery-1.11.1'
    }
});

requirejs([
        'jquery', 'graph'
        ],
function ($, graph) {
    var ONE_FRAME_TIME = 1000/60;
    var TIME_DELTA = 1 / ONE_FRAME_TIME;

    var canvasElement = $("#myCanvas").get(0);
	var ctx = canvasElement.getContext('2d');
    var CANVAS_WIDTH = canvasElement.width;
    var CANVAS_HEIGHT = canvasElement.height;
    ctx.width = CANVAS_WIDTH;
    ctx.height = CANVAS_HEIGHT;


    var g = new graph.Graph(CANVAS_WIDTH, CANVAS_HEIGHT);

    var shiftDown = false;

    $("#myCanvas").click(function (event){
        if (shiftDown) {
            g.markNearestNodeAsWall(event.offsetX, event.offsetY);
        } else {
            g.markNearestNode(event.offsetX, event.offsetY);
        }
    });
    $(document).keyup(function (event) {
        if (event.which === 13){
            var result = g.calculatePath();
            if (result) {
                alert(result);
            }
        } else if (event.which === 16) {
            shiftDown = false;
        }
    });
    $(document).keydown(function (event) {
        if (event.which === 16) {
            shiftDown = true;
        }
    });
    setInterval(function () {
        // clear screen
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, ctx.width, ctx.height);

        g.draw(ctx);
    }, 1000/60);

});
