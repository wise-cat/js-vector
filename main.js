function Path(data) {
	var self = this;
	if (typeof data == "string") {
		data = JSON.parse(data);
	}
	self.points = data.points;
	{
		var path = new Path2D();
		var p = self.points;
		path.moveTo(p[0], p[1]);
		for (var i = 0; i < (p.length - 2)/6; ++i) {
			var b = 2 + 6*i;
			path.bezierCurveTo(p[b+0], p[b+1], p[b+2], p[b+3], p[b+4], p[b+5]);
		}
		self.path = path;
	}
	
	self.stroke = data.stroke;
	self.fill = data.fill;

	self.draw = function(ctx) {
		if (self.fill) {
			ctx.fillStyle = self.fill;
			ctx.fill(self.path);
		}
		if (self.stroke) {
			if (self.stroke.color) { ctx.strokeStyle = self.stroke.color; }
			if (self.stroke.width) { ctx.lineWidth = self.stroke.width; }
			ctx.stroke(self.path);
		}
	};
}
