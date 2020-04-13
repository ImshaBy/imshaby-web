var graphConfig = new GitGraph.Template({
  colors: [ "#9993FF", "#47E8D4", "#6BDB52", "#F85BB5", "#FFA657", "#F85BB5" ],
  branch: {
    color: "#000000",
    lineWidth: 3,
    spacingX: 60,
    mergeStyle: "straight",
    showLabel: true, // display branch names on graph
    labelFont: "normal 10pt Arial",
    labelRotation: 0
  },
  commit: {
    spacingY: -30,
    dot: {
      size: 8,
      strokeColor: "#000000",
      strokeWidth: 4
    },
    tag: {
      font: "normal 10pt Arial",
      color: "yellow"
    },
    message: {
      color: "black",
      font: "normal 12pt Arial",
      displayAuthor: false,
      displayBranch: false,
      displayHash: false,
    }
  },
  arrow: {
    size: 8,
    offset: 3
  }
});

var config = {
  template: graphConfig,
  mode: "extended",
  orientation: "horizontal"
};

var bugFixCommit = {
  messageAuthorDisplay: false,
  messageBranchDisplay: false,
  messageHashDisplay: false,
  message: "Bug fix commit(s)"
};

var stabilizationCommit = {
  messageAuthorDisplay: false,
  messageBranchDisplay: false,
  messageHashDisplay: false,
  message: "Release stabilization commit(s)"
};

// You can manually fix columns to control the display.
var featureCol = 0;
var developCol = 1;
var releaseCol = 2;
var supportCol = 3;
var support2Col = 5;
var masterCol = 4;

var gitgraph = new GitGraph(config);

var master = gitgraph.branch({
  name: "master",
  column: masterCol
});
master.commit("Initial commit");

var develop = gitgraph.branch({
  parentBranch: master,
  name: "develop",
  column: developCol
});
master.commit({
  messageDisplay: false
});
develop.commit({
  messageDisplay: false
});

var feature1 = gitgraph.branch({
  parentBranch: develop,
  name: "feature/1",
  column: featureCol
});
feature1.commit("A feature to go into v1.0.0").commit({
  messageDisplay: false
});
feature1.merge(develop);

var feature2 = gitgraph.branch({
  parentBranch: develop,
  name: "feature/2",
  column: featureCol
});
feature2.commit("Another feature to go into v1.0.0").commit({
  messageDisplay: false
});
feature2.merge(develop);

var release_100 = gitgraph.branch({
  parentBranch: develop,
  name: "release/v1.0.0",
  column: releaseCol
});
release_100.commit({
  message: "Start v1.0.0-rc Release Candidate builds",
  tag: "v1.0.0-rc",
  tagColor: 'gray'
});
develop.commit({
  messageDisplay: false
});
release_100.commit(stabilizationCommit);
release_100.merge(master, {
  dotStrokeWidth: 10,
  message: "Release v1.0.0 tagged",
  tag: "v1.0.0"
});
master.merge(develop);

var support_10x = gitgraph.branch({
  parentBranch: master,
  name: "support/v1.0.x",
  column: supportCol
});

support_10x.commit({
  message: "Start v1.0.1-rc Release Candidate builds",
  tag: "v1.0.1-rc",
  tagColor: 'gray'
}).commit(bugFixCommit);
develop.commit({
  messageDisplay: false
});

var feature3 = gitgraph.branch({
  parentBranch: develop,
  name: "feature/3",
  column: featureCol
});

feature3.commit("A feature to go into v1.1.0").commit({
  messageDisplay: false
});
feature3.merge(develop);

support_10x.commit({
  dotStrokeWidth: 10,
  message: "Release v1.0.1 tagged",
  tag: "v1.0.1"
}).merge(develop);

develop.commit({
  messageDisplay: false
});
support_10x.commit({
  message: "Start v1.0.2-rc Release Candidate builds",
  tag: "v1.0.2-rc",
  tagColor: 'gray'
})
support_10x.commit(bugFixCommit).commit({
  dotStrokeWidth: 10,
  message: "Release v1.0.2 tagged",
  tag: 'v1.0.2'
});
support_10x.merge(develop);
develop.commit({
  messageDisplay: false
});

var release_110 = gitgraph.branch({
  parentBranch: develop,
  name: "release/v1.1.0",
  column: releaseCol
});
release_110.commit({
  message: "Start v1.1.0-rc Release Candidate builds",
  tag: "v1.1.0-rc",
  tagColor: 'gray'
})
release_110.commit(stabilizationCommit);
release_110.merge(master, {
  dotStrokeWidth: 10,
  message: "Release v1.1.0 tagged",
  tag: "v1.1.0"
});
