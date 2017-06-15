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

function Transformation() {
	var self = this;
	self.stack = [];
	self.accum = [1,0,0,1,0,0];
	self.update = function () {
		var m = [1,0,0,1,0,0];
		var ma = self.accum;
		for (var i = 0; i < self.stack.length; ++i) {
			var mi = self.stack[i];
			ma[0] = mi[0]*m[0] + mi[1]*m[2];
			ma[1] = mi[0]*m[1] + mi[1]*m[3];
			ma[2] = mi[2]*m[0] + mi[3]*m[2];
			ma[3] = mi[2]*m[1] + mi[3]*m[3];
			ma[4] = mi[0]*m[4] + mi[1]*m[5] + mi[4];
			ma[5] = mi[2]*m[4] + mi[3]*m[5] + mi[5];
			for (var j = 0; j < 6; ++j) {
				m[j] = ma[j];
			}
		}
	};
	self.push = function (m) {
		self.stack.push(m);
		self.update();
	};
	self.pop = function () {
		var m = self.stack.pop();
		self.update();
		return m;
	};
	self.size = function () {
		return self.stack.length;
	};
	self.apply = function (ctx) {
		var m = self.accum;
		ctx.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);
	};
	self.forward = function (vi) {
		var m = self.accum;
		return [
			vi[0]*m[0] + vi[1]*m[1] + m[4],
			vi[0]*m[2] + vi[1]*m[3] + m[5]
		];
	};
	self.backward = function (vi) {
		var m = self.accum;
		var d = 1.0*(m[0]*m[3] - m[1]*m[2]);
		var im = [m[3]/d,-m[1]/d,-m[2]/d,m[0]/d];
		var vo = [vi[0]-m[4],vi[1]-m[5]];
		return [
			vo[0]*im[0] + vo[1]*im[1],
			vo[0]*im[2] + vo[1]*im[3]
		];
	};
}
