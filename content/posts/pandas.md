+++
date = '2025-03-17T19:27:56-06:00'
title = 'Opinion: Polars > Pandas'
draft = true
+++

# Opinion: Polars > Pandas

If you've ever worked with me, you'll know that I hate the pandas library for python. 
That's why, when we started setting up our data program at my current employer, I pushed to use polars, instead.

Pandas isn't awful. Some people might argue that pandas is the reason that python was able to get a foothold and become the main choice
for data science. It's fine for research and prototyping as well. If you're doing anything with managed or cloud-hosted environments for data science 
it's probably already installed and easy to get started with. I will occasionally use pandas because of these scenarios. 

But, pandas is _awful_ for writing production code. 

There are a few reasons why this is true:

### 1. Good pandas code exists, but instances of it are few and far-between

Most pandas code on the internet is written by beginners, statisticians, or data scientists; very little is written by software developers.

As a person that exists in the intersection between data scientist and software developer, I understand that I'm part of a small subset of either group. 
However, I'm a big advocate for making the right thing easy, especially when a user base consists mainly of beginners or non-developers.

### 2. There are multiple ways of doing things in pandas, and they aren't stable.

It's extremely frustrating to be looking for help on the internet, only to find that the solutions are written in a different pattern than what you're using.
Or, maybe you're using the right pattern, but when you try to use a function it's deprecated or removed.

Crosstab vs pivot vs pivot_table

Why can't I work on indices the same way I work on columns?

So many reset_index calls everywhere.

### 3. Behaviour changes depending on the data in the table

The first time this happened to me I was livid. Let's look at a basic assertion, shall we?



