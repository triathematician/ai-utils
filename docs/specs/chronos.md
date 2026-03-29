# Chronos: Vertical ASCII Timeline Specification

## 1. Project Overview
Chronos is a high-precision, developer-centric timeline visualizer. It renders temporal data in a "mimicked ASCII" style using a DOM-based monospaced grid. The application centers on a command-driven workflow and a strict Directed Acyclic Graph (DAG) for event relationships.

## 2. Core Data Model
The system treats time as a strict linear progression. Data integrity is prioritized through temporal validation.

### 2.1 Event Schema
- **UID**: Unique identifier (UUID or short-hash).
- **Timestamp**: ISO 8601 string (Resolution: milliseconds).
- **Label**: Primary event text.
- **Categories**: Array of strings.
    - *Primary Swimlane*: The first category in the array determines the node's main column.
- **Dependencies**: Array of UIDs.
    - *Constraint*: Dependent UIDs must have a timestamp less than or equal to the target event.
- **Metadata**: Key-value pairs for extended tooltips and attributes.

### 2.2 Validation Logic
- **Temporal Integrity**: New dependencies are rejected if $T_{dependency} > T_{target}$.
- **Cycle Prevention**: The temporal constraint inherently prevents cycles within the graph.

---

## 3. UI & Rendering Engine
The interface utilizes a monospaced grid to simulate a terminal environment while leveraging modern web capabilities.

### 3.1 The Vertical Grid
- **Strict Linear Scale**: The Y-axis is a fixed temporal scale. 1 row = $N$ units of time.
- **Swimlanes**: The X-axis is partitioned into columns based on active categories.
- **Visual Nodes**:
    - **Primary Node**: Rendered with ASCII box-drawing characters (e.g., `┌───┐`).
    - **Secondary Indicators**: Single-character markers (e.g., `*`) in other category columns.
- **Relationships**: Visualized via ASCII pipes (`|`, `V`, `\`, `/`) connecting dependent nodes.

### 3.2 Navigation & Zooming
- **Zoom Levels**: Smooth scaling from Year-level views down to `HH:MM:SS`.
- **Temporal Gaps**: When events are separated by large durations, "Edge Markers" appear at the viewport bounds.
    - *Example*: `[^] 14:02:10 to 'Previous_Event'`
- **Input**: Mouse wheel for scrolling; `Ctrl + Wheel` for zooming.

---

## 4. Command Grammar
Interaction follows a `/command` syntax for efficiency and consistency.

| Command | Syntax | Description |
| :--- | :--- | :--- |
| **Add** | `/add <label> -t <time> -c <cats> -d <ids>` | Create a new event node. |
| **Toggle** | `/show <cat>` / `/hide <cat>` | Toggle swimlane visibility. |
| **Link** | `/link <src_id> <target_id>` | Establish a temporal dependency. |
| **GoTo** | `/goto <id>` / `/goto <time>` | Center viewport on a specific point. |
| **Export** | `/export <txt|json>` | Generate a snapshot or data file. |

---

## 5. Persistence & Formatting
- **Data Persistence**: Local storage by default; supports importing/exporting JSON.
- **Export Formats**:
    - **.json**: Full DAG structure and metadata.
    - **.txt**: A stylized, monospaced ASCII-art representation of the current view.
- **Styling**: Monospaced fonts only. Color is used exclusively for category differentiation rather than structural borders.