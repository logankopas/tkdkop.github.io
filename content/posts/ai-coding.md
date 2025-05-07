+++
date = '2025-05-07'
title = 'Will AI Coding Tools Change Software Patterns?'
draft = false
+++

# Will AI Coding Tools Change Software Patterns?

_"Let's change our code to a monolith so that it's easier for an LLM to parse."_

_&emsp;-- some guy on reddit_

I came across a comment on reddit joking that a company should turn their repos into a monolith in order for AI coding assistants to have
an easier time parsing their code.
I'm not sure if anyone is making any architectural changes in response to AI coding tools, 
but I recently came across a situation where conventional best-practices could be called into question if coding assistants become the norm.

## Setting the Scene

The scenario in question pertains to a dashboarding tool built on [Dash](https://dash.plotly.com/).

Dash is a callback-based framework. In a nutshell: 
a page is made up of various components;
callbacks are registered with components;
when a component changes, any callbacks with that component registered as an input are called;
when a callback runs it can modify any or all of its output components;
repeat for all modified components.

The bulk of the content of the dashboarding tool we are building are what we call "scorecards": basically a square on the page that we put either a number or a chart in.
There are approximately 100 of these scorecards (so far), each of which have nearly identical function signatures and precondition checks.

The question in this case, as you may have guessed, is one of abstractions.

## The Problem

Call me lazy, but any time I have to deal with hundreds of a thing I like to abstract or encapsulate them into 1 thing. 
We tried this, of course, but if it were as easy as it sounds that wouldn't make for good writing.

The way that callbacks are registered in Dash is via the use of a decorator:
```python
@dash.callback(
    Output('success-box', 'children'),
    Input('submit-button', 'n_clicks'),
    background=True
)
def get_data(button_clicked):
    return 'Success!'
```

Each of our scorecards has a callback function responsible for loading the relevant data, applying any data filters, and generating the display element, in addition to some sanity checks.
Much of the data loading and manipulation is handled elsewhere, but we're left with 100+ of these functions with nearly the same list of inputs and outputs, and the same sanity checking logic. 

Ideally we could just generate a callback for each scorecard, but since these callbacks deal with data loading they are dispatched to Celery workers.
The implication of this is that all callbacks have to be registerd _at startup time_, which prevents us from doing any sort of dynamic callback generation.

I'll skip the story about the things we tried and failed, and get to the part where we ended up writing a new decorator and function wrapper that encapsulates
the `@dash.callback` decorator and performs the sanity checking logic that every callback performs.


## The Abstraction-Complexity Tradeoff

In order to decide if this decorator-of-a-decorator is a good abstraction, let's evaluate if it's adding or removing complexity. 

On the one hand, reasoning about decorators in python is a difficult process, and I don't envy the first time my colleagues have to make changes to this logic. 
On the other hand, if we make a change to our scorecard logic (_which I've done twice since adding this new level of abstraction_) it means changing 100+ functions, which is tedious and error prone.

I feel that the addition of this decorator encapsulation is worth the complexity cost, especially if it prevents us from hesitating to make necessary changes to our callbacks to avoid tedium.

## Do AI Coding Assistants Change the Calculus?

The company I work at has privacy policies preventing us from using AI coding tools, so this was not a factor in my decision, but it got me contemplating whether AI tools could change the calculus of my decision.

The driving factor in my decision is the inherent difficulty changing code in 100+ places. 
To give a bit more context, I am a `vim` guy and the thought of writing a macro to change 100+ callbacks at once sounds insane. 
I have not used Cursor, Copilot, or whatever flavour of AI agent is popular when you read this, so I don't know if the current capabilities would make this task feasible. 
I used tabnine years ago, and I think it had the ability to do something like this, although probably not across an entire repo. 

In the interest of discussion, let's say that coding assistants make it easy to change 100+ similar functions simultaneously. 
Does this change what we'd consider best practices? 

If I follow this train of thought, I don't like where it leads. 
How much can I trust a coding assistant to change all 100+ callbacks correctly? 
If I tell Copilot or Cursor to make this change, do I then spend the same amount of time I saved testing everything? 
At what point does my job go from solving hard problems to testing the output of AI changes in response to hard problems? 

