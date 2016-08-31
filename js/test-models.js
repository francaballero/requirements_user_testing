//Reading test requirements
var reading = [{
    id: 1,
    req: "Validate notebook file format.",
    question: "Is it necessary to specify the file format so that the requirement is completed? Why?",
    type: "natural",
    answer: "",
    time_r: 0
        }, {
    id: 2,
    req: "The system shall provide users with the ability to resolve merge conflicts manually.",
    question: "Is the requirement complete?",
    type: "master",
    answer: "",
    time_r: 0
        }, {
    id: 3,
    req: "If a merge is not intentioned, the system should provide users with the ability to undo the merge.",
    type: "master",
    question: "Could the requirement have more than one interpretation? Why?",
    answer: "",
    time_r: 0
        }, {
    id: 4,
    req: "If an IPython Notebook file is corrupted, then the system shall display a message to the user.",
    question: "Should the requirement be specified in more/less detail? Why?",
    type: "ears",
    answer: "",
    time_r: 0
        }, {
    id: 5,
    req: "While the system is requesting a notebook from remote servers, the system shall not accept parallels requests to the same notebook.",
    type: "ears",
    question: "Is the requirement testable?",
    answer: "",
    time_r: 0
}];



// Writing test requirements
var writing = [{
    id: 1,
    description: "This functionality allows the user to diff and display modifications made between two versions of the same IPython notebook, allowing the user to view the added, removed or modified elements.",
    time_r: 0,
    master: "true",
    ears: "true",
    natural: "true"
        }, {
    id: 2,
    description: "This functionality allows the user to generate a diff of a notebook from two local IPYNB files, provided by the user.",
    time_r: 0,
    master: "true",
    ears: "false",
    natural: "false"
        }, {
    id: 3,
    description: "This functionality generates a diff of a notebook on a line based level for text based cells, indicating to the user when a cell has been modified and which lines were added or deleted.",
    time_r: 0,
    master: "false",
    ears: "true",
    natural: "false"
        }, {
    id: 4,
    description: "When the version control system encounters a merge conflict between the notebook version the user is trying to commit and the remote head, this functionality allows the users to see the differences between the two notebooks. The user is able to resolve this merge conflict by using the visual representation to select which modifications to accept or discard. The system will handle this conflict by creating a merged notebook for the version control system to commit.",
    time_r: 0,
    master: "true",
    ears: "true",
    natural: "true"
}];



//Writing test terms
var terms = [{
    name: "a merge conflict",
    definition: "Merge conflict between the notebook version commited and the remote head."
            }, {
    name: "a diff between two versions",
    definition: "Diff an display added, removed or modified elements between two versions of the same IPython notebook."
            }, {
    name: "conflict by using visual representation",
    definition: "Allows the user to select which modifications to accept or discard."
            }, {
    name: "encounters",
    definition: "Detect or discover."
            }, {
    name: " a diff from two local files",
    definition: "Diff added, removed or modified elements between two locally stored IPYNB files provided by the user."
            }, {
    name: "generate",
    definition: "Produce and display."
            }, {
    name: "generate a diff of a notebook from two local files",
    definition: "Diff an display added, removed or modified elements between two locally stored IPYNB files provided by the user."
            }, {
    name: "generate line based diffs for text based cells",
    definition: "Display when a cell has been modified and which lines were added or deleted."
            }, {
    name: "resolve",
    definition: "Find a solution."
            }, {
    name: "system",
    definition: "NBDiff system."
            }, {
    name: "the system",
    definition: "NBDiff system."
            }, {
    name: "the user",
    definition: "User of NBDiff system."
            }, {
    name: "users",
    definition: "Users of NBDiff system."
}];