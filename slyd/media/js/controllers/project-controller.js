ASTool.ProjectIndexController = Em.ArrayController.extend(ASTool.BaseControllerMixin, {

	needs: ['application', 'spider_index'],

	documentView: null,

	spiderPage: null,

	nameBinding: 'slyd.project',

	navigationLabelBinding: 'slyd.project',

	createSpiderDisabled: function() {
		return Em.isEmpty(this.get('spiderPage'));
	}.property('spiderPage'),

	addSpider: function() {
		var siteUrl = this.get('spiderPage') || this.get('controllers.application.siteWizard');
		if (siteUrl.indexOf('http') != 0) {
			siteUrl = 'http://' + siteUrl;
		}
		var newSpiderName = this.getUnusedName(URI.parse(siteUrl).hostname, this.get('content'));
		this.set('controllers.application.siteWizard', siteUrl);
		var spider = ASTool.Spider.create( 
			{ 'name': newSpiderName,
			  'start_urls': [],
			  'follow_patterns': [],
			  'exclude_patterns': [],
			  'init_requests': [],
			  'templates': [] });
		this.pushObject(newSpiderName);
		this.set('spiderPage', null);
		return this.get('slyd').saveSpider(spider, newSpiderName).then(function() {
				this.editSpider(newSpiderName);
		}.bind(this), function(error) {
			console.log(error);
		});
	},

	editSpider: function(spiderName) {
		this.get('slyd').loadSpider(spiderName).then(function(spider) {
			this.transitionToRoute('spider', spider);
		}.bind(this));
	},

	actions: {

		editSpider: function(spiderName) {
			this.editSpider(spiderName);
		},

		addSpider: function() {
			this.addSpider();
		},

		deleteSpider: function(spiderName) {
			if (confirm('Are you sure you want to delete spider ' + spiderName + '?')) {
				this.get('slyd').deleteSpider(spiderName);
				this.removeObject(spiderName);
			}
		},

		rename: function(oldName, newName) {
			this.get('slyd').renameProject(oldName, newName).then(
				function() {
					this.replaceRoute('project', { id: newName });
				}.bind(this),
				function(reason) {
					this.set('name', oldName);
					alert('The name ' + newName + ' is not a valid project name.');
				}.bind(this)
			);
		},
	},

	willEnter: function() {
		this.get('documentView').showSpider();
		if (this.get('controllers.application.siteWizard')) {
			Em.run.next(this, this.addSpider);
		}
	},
});
