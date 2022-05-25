🟢

Use `key` to reanimate

```js
<Chart entries={entries} key={exerciseId} />
```

🟢 Fun idea - animating circles

```jsx
{
  data.map((d, i) => (
    <motion.circle
      key={d.date}
      r="5"
      cx={x(d.date)}
      // cy={y(d.estimatedMax)}
      initial={{ cy: height - margin.bottom }}
      animate={{ cy: y(d.estimatedMax) }}
      transition={{ duration: 0.5, delay: 0.1 * i }}
      fill="currentColor"
      stroke={
        months.findIndex((m) => isSameMonth(m, d.date)) % 2 === 0
          ? "white"
          : colors.gray[100]
      }
      strokeWidth={2}
    />
  ));
}
```
